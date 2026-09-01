import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import dndModule from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { usePosts, useScheduleInsight } from '../context/PostContext';
import { getSchedulingInsight } from '../data/schedulingInsights';
import PostModal from './PostModal';

moment.updateLocale('en', { week: { dow: 1, doy: 4 } });
const localizer = momentLocalizer(moment);
const DnDCalendar = (dndModule.default || dndModule)(Calendar);

const OptimizedEvent = memo(function OptimizedEvent({ event }) {
  return <span className="optimized-event"><span>{event.title}</span>{event.optimization && <b className={event.optimization.score}>{event.optimization.preference}</b>}</span>;
}, (previous, next) => previous.event === next.event);

function hasSameOptimization(previous, next) {
  return previous && previous.preference === next.preference && previous.score === next.score &&
    previous.label === next.label && previous.message === next.message &&
    previous.conflicts.map((post) => post.id).join() === next.conflicts.map((post) => post.id).join() &&
    previous.factors.every((factor, index) => factor.value === next.factors[index]?.value);
}

function buildOptimization(posts, previousResults = []) {
  const previousById = new Map(previousResults.map((result) => [result.id, result]));
  const results = posts.map((post) => {
    const nextResult = getSchedulingInsight(post, post.start, posts, post.end);
    const previousResult = previousById.get(post.id);
    return hasSameOptimization(previousResult, nextResult) ? previousResult : nextResult;
  });
  return {
    results,
    summary: {
      average: results.length ? Math.round(results.reduce((total, result) => total + result.preference, 0) / results.length) : 0,
      great: results.filter((result) => result.score === 'great').length,
      fair: results.filter((result) => result.score === 'fair').length,
      poor: results.filter((result) => result.score === 'poor').length,
    },
  };
}

function isSameCalendarDay(first, second) {
  return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth() && first.getDate() === second.getDate();
}

function CalendarView() {
  const { posts, reschedulePost, updatePost, deletePost, addPost } = usePosts();
  const { setScheduleInsight, calendarOptimization, setCalendarOptimization } = useScheduleInsight();
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [date, setDate] = useState(new Date());
  const optimizationTimer = useRef(null);
  const optimizedEventCache = useRef(new Map());
  const visiblePosts = useMemo(() => {
    const weekStart = moment(date).startOf('isoWeek').toDate();
    const weekEnd = moment(date).endOf('isoWeek').toDate();
    return posts.filter((post) => new Date(post.start) <= weekEnd && new Date(post.end) >= weekStart);
  }, [date, posts]);
  const optimizationById = useMemo(() => new Map(calendarOptimization.results.map((result) => [result.id, result])), [calendarOptimization.results]);
  const events = useMemo(() => {
    if (!calendarOptimization.enabled || calendarOptimization.analyzing) {
      optimizedEventCache.current.clear();
      return visiblePosts.map((post) => ({ ...post, title: post.title, optimization: null }));
    }
    const activeIds = new Set(visiblePosts.map((post) => post.id));
    for (const id of optimizedEventCache.current.keys()) if (!activeIds.has(id)) optimizedEventCache.current.delete(id);
    return visiblePosts.map((post) => {
      const optimization = optimizationById.get(post.id);
      const cached = optimizedEventCache.current.get(post.id);
      if (cached?.post === post && cached.optimization === optimization) return cached.event;
      const event = { ...post, title: post.title, optimization };
      optimizedEventCache.current.set(post.id, { post, optimization, event });
      return event;
    });
  }, [calendarOptimization.analyzing, calendarOptimization.enabled, optimizationById, visiblePosts]);

  useEffect(() => () => window.clearTimeout(optimizationTimer.current), []);
  useEffect(() => {
    if (!calendarOptimization.enabled || calendarOptimization.analyzing) return;
    const { results, summary } = buildOptimization(visiblePosts, calendarOptimization.results);
    setCalendarOptimization({ enabled: true, analyzing: false, results, summary });
  }, [calendarOptimization.analyzing, calendarOptimization.enabled, setCalendarOptimization, visiblePosts]);

  const openCreate = useCallback((start = new Date()) => {
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 30);
    setSelectedPost({ id: null, title: '', platform: 'Instagram', status: 'draft', start, end, notes: '' });
    setModalMode('create');
  }, []);

  const closeModal = useCallback(() => { setModalMode(null); setSelectedPost(null); }, []);

  const handleSave = useCallback((post) => {
    const finalPost = modalMode === 'create' ? { ...post, id: crypto.randomUUID(), preferredStart: post.start } : post;
    if (modalMode === 'create') addPost(finalPost);
    else updatePost(finalPost);
    setScheduleInsight(getSchedulingInsight(finalPost, finalPost.start, posts, finalPost.end));
    closeModal();
  }, [addPost, closeModal, modalMode, posts, setScheduleInsight, updatePost]);

  const assessMove = useCallback(({ event, start, end }) => {
    const originalStart = new Date(event.start);
    const originalEnd = new Date(event.end);
    const newStart = new Date(start);
    let newEnd = new Date(end);

    const eventWithPreference = { ...event, preferredStart: event.preferredStart || originalStart };
    reschedulePost(event.id, newStart, newEnd, eventWithPreference.preferredStart);
    setScheduleInsight(getSchedulingInsight(eventWithPreference, newStart, posts, newEnd));
  }, [posts, reschedulePost, setScheduleInsight]);

  const handleDragStart = useCallback(({ event }) => setScheduleInsight(getSchedulingInsight(event, event.start, posts, event.end)), [posts, setScheduleInsight]);

  const toggleOptimization = useCallback(() => {
    if (calendarOptimization.enabled) {
      window.clearTimeout(optimizationTimer.current);
      setCalendarOptimization({ enabled: false, analyzing: false, results: [], summary: null });
      return;
    }
    setCalendarOptimization({ enabled: true, analyzing: true, results: [], summary: null });
    optimizationTimer.current = window.setTimeout(() => {
      const { results, summary } = buildOptimization(visiblePosts);
      setCalendarOptimization({ enabled: true, analyzing: false, results, summary });
    }, 500);
  }, [calendarOptimization.enabled, setCalendarOptimization, visiblePosts]);

    const clashIds = useMemo(() => {
    const clashing = new Set();
    const isSameDay = (a, b) =>
      a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    for (let i = 0; i < visiblePosts.length; i++) {
      for (let j = i + 1; j < visiblePosts.length; j++) {
        const a = visiblePosts[i], b = visiblePosts[j];
        const overlaps = new Date(a.start) < new Date(b.end) && new Date(b.start) < new Date(a.end);
        const sameDay = isSameDay(new Date(a.start), new Date(b.start));
        if (overlaps || sameDay) {
          clashing.add(a.id);
          clashing.add(b.id);
        }
      }
    }
    return clashing;
  }, [visiblePosts]);

  const eventPropGetter = useCallback((event) => ({
    style: {
      backgroundColor: event.color || '#6d5dfc',
      borderRadius: '6px',
      opacity: event.status === 'published' ? .7 : 1,
      color: 'white',
      border: clashIds.has(event.id) ? '2px solid #ff4d4f' : 'none',
      boxShadow: clashIds.has(event.id) ? '0 0 6px rgba(255,77,79,0.6)' : 'none',
    },
  }), [clashIds]);

  const title = useMemo(() => {
    const weekStart = moment(date).startOf('isoWeek');
    const weekEnd = moment(date).endOf('isoWeek');
    return weekStart.month() === weekEnd.month()
      ? `${weekStart.format('D')} - ${weekEnd.format('D MMMM YYYY')}`
      : `${weekStart.format('D MMM')} - ${weekEnd.format('D MMM YYYY')}`;
  }, [date]);
  const weekDays = useMemo(() => {
    const weekStart = moment(date).startOf('isoWeek');
    return Array.from({ length: 7 }, (_, index) => {
      const day = weekStart.clone().add(index, 'days');
      const dayDate = day.toDate();
      const dayPosts = visiblePosts.filter((post) => isSameCalendarDay(new Date(post.start), dayDate));
      const scores = dayPosts.map((post) => optimizationById.get(post.id)?.preference).filter(Number.isFinite);
      return { key: day.format('YYYY-MM-DD'), day, dayDate, posts: dayPosts.length, score: scores.length ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length) : null };
    });
  }, [date, optimizationById, visiblePosts]);
  const openDayPlanner = useCallback((dayDate) => {
    const start = new Date(dayDate);
    start.setHours(9, 0, 0, 0);
    openCreate(start);
  }, [openCreate]);
  const selectEvent = useCallback((event) => { setSelectedPost(event); setModalMode('edit'); }, []);
  const selectSlot = useCallback(({ start }) => openCreate(start), [openCreate]);
  const deleteAndClose = useCallback((id) => { deletePost(id); closeModal(); }, [closeModal, deletePost]);

  return (
    <section className="calendar-wrapper" aria-label="Post scheduling calendar">
      <div className="calendar-toolbar">
        <div>
          <h2 className="calendar-title">{title}</h2>
          <p className="calendar-subtitle">{events.length} posts in this 7-day plan</p>
        </div>
        <div className="calendar-actions">
          <div className="date-actions">
            <button onClick={() => setDate(new Date())}>Today</button>
            <button aria-label="Previous week" onClick={() => setDate(moment(date).subtract(1, 'week').toDate())}>&lsaquo;</button>
            <button aria-label="Next week" onClick={() => setDate(moment(date).add(1, 'week').toDate())}>&rsaquo;</button>
          </div>
          <button className="add-post" onClick={() => openCreate()}>+ New post</button>
          <button className={`optimize-toggle ${calendarOptimization.enabled ? 'enabled' : ''} ${calendarOptimization.analyzing ? 'analyzing' : ''}`} onClick={toggleOptimization} aria-pressed={calendarOptimization.enabled}>
            <i aria-hidden="true" />{calendarOptimization.analyzing ? 'Analyzing...' : calendarOptimization.enabled ? 'Optimization on' : 'Optimize calendar'}
          </button>
        </div>
      </div>
      <div className="week-planner" aria-label="Seven day scheduling planner">
        {weekDays.map((day) => <button key={day.key} className={`week-day-box ${isSameCalendarDay(day.dayDate, new Date()) ? 'today' : ''}`} onClick={() => openDayPlanner(day.dayDate)}>
          <span>{day.day.format('ddd')}</span><strong>{day.day.format('D')}</strong><small>{day.posts ? `${day.posts} post${day.posts > 1 ? 's' : ''}` : 'Add post'}</small>{calendarOptimization.enabled && !calendarOptimization.analyzing && <b className={day.score >= 78 ? 'great' : day.score >= 55 ? 'fair' : 'poor'}>{day.score === null ? '--' : `${day.score}%`}</b>}
        </button>)}
      </div>
      <div className="calendar-body">
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          resizable
          popup
          toolbar={false}
          step={15}
          timeslots={4}
          longPressThreshold={150}
          view="week"
          views={['week']}
          date={date}
          onNavigate={setDate}
          onDragStart={handleDragStart}
          onEventDrop={assessMove}
          onEventResize={assessMove}
          onSelectEvent={selectEvent}
          onSelectSlot={selectSlot}
          eventPropGetter={eventPropGetter}
          components={{ event: OptimizedEvent }}
        />
      </div>
      {modalMode && <PostModal post={selectedPost} mode={modalMode} onClose={closeModal} onSave={handleSave} onDelete={deleteAndClose} />}
    </section>
  );
}

export default memo(CalendarView);
