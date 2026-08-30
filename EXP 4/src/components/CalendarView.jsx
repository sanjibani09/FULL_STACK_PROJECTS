import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import dndModule from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { usePosts, useScheduleInsight } from '../context/PostContext';
import { getSchedulingInsight } from '../data/schedulingInsights';
import PostModal from './PostModal';

const localizer = momentLocalizer(moment);
const DnDCalendar = (dndModule.default || dndModule)(Calendar);
const viewLabels = { month: 'Month', week: 'Week', day: 'Day' };

function OptimizedEvent({ event }) {
  return <span className="optimized-event"><span>{event.title}</span>{event.optimization && <b className={event.optimization.score}>{event.optimization.preference}</b>}</span>;
}

function buildOptimization(posts) {
  const results = posts.map((post) => getSchedulingInsight(post, post.start, posts, post.end));
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

function CalendarView() {
  const { posts, reschedulePost, updatePost, deletePost, addPost } = usePosts();
  const { setScheduleInsight, calendarOptimization, setCalendarOptimization } = useScheduleInsight();
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const optimizationTimer = useRef(null);
  const optimizationById = useMemo(() => new Map(calendarOptimization.results.map((result) => [result.id, result])), [calendarOptimization.results]);
  const events = useMemo(() => posts.map((post) => ({ ...post, title: post.title, optimization: calendarOptimization.enabled && !calendarOptimization.analyzing ? optimizationById.get(post.id) : null })), [calendarOptimization.analyzing, calendarOptimization.enabled, optimizationById, posts]);

  useEffect(() => () => window.clearTimeout(optimizationTimer.current), []);
  useEffect(() => {
    if (!calendarOptimization.enabled || calendarOptimization.analyzing) return;
    const { results, summary } = buildOptimization(posts);
    setCalendarOptimization({ enabled: true, analyzing: false, results, summary });
  }, [calendarOptimization.analyzing, calendarOptimization.enabled, posts, setCalendarOptimization]);

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

  const assessMove = useCallback(({ event, start, end, allDay }) => {
    const originalStart = new Date(event.start);
    const originalEnd = new Date(event.end);
    const newStart = new Date(start);
    let newEnd = new Date(end);

    if (view === 'month' && (allDay || (newStart.getHours() === 0 && newStart.getMinutes() === 0))) {
      newStart.setHours(originalStart.getHours(), originalStart.getMinutes(), 0, 0);
      newEnd = new Date(newStart.getTime() + (originalEnd.getTime() - originalStart.getTime()));
    }

    const eventWithPreference = { ...event, preferredStart: event.preferredStart || originalStart };
    reschedulePost(event.id, newStart, newEnd, eventWithPreference.preferredStart);
    setScheduleInsight(getSchedulingInsight(eventWithPreference, newStart, posts, newEnd));
  }, [posts, reschedulePost, setScheduleInsight, view]);

  const handleDragStart = useCallback(({ event }) => setScheduleInsight(getSchedulingInsight(event, event.start, posts, event.end)), [posts, setScheduleInsight]);

  const toggleOptimization = useCallback(() => {
    if (calendarOptimization.enabled) {
      window.clearTimeout(optimizationTimer.current);
      setCalendarOptimization({ enabled: false, analyzing: false, results: [], summary: null });
      return;
    }
    setCalendarOptimization({ enabled: true, analyzing: true, results: [], summary: null });
    optimizationTimer.current = window.setTimeout(() => {
      const { results, summary } = buildOptimization(posts);
      setCalendarOptimization({ enabled: true, analyzing: false, results, summary });
    }, 500);
  }, [calendarOptimization.enabled, posts, setCalendarOptimization]);

    const clashIds = useMemo(() => {
    const clashing = new Set();
    const isSameDay = (a, b) =>
      a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    for (let i = 0; i < posts.length; i++) {
      for (let j = i + 1; j < posts.length; j++) {
        const a = posts[i], b = posts[j];
        const overlaps = new Date(a.start) < new Date(b.end) && new Date(b.start) < new Date(a.end);
        const sameDay = isSameDay(new Date(a.start), new Date(b.start));
        if (overlaps || sameDay) {
          clashing.add(a.id);
          clashing.add(b.id);
        }
      }
    }
    return clashing;
  }, [posts]);

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

  const title = useMemo(() => moment(date).format(view === 'day' ? 'dddd, D MMMM' : 'MMMM YYYY'), [date, view]);
  const selectEvent = useCallback((event) => { setSelectedPost(event); setModalMode('edit'); }, []);
  const selectSlot = useCallback(({ start }) => openCreate(start), [openCreate]);
  const deleteAndClose = useCallback((id) => { deletePost(id); closeModal(); }, [closeModal, deletePost]);

  return (
    <section className="calendar-wrapper" aria-label="Post scheduling calendar">
      <div className="calendar-toolbar">
        <div>
          <h2 className="calendar-title">{title}</h2>
          <p className="calendar-subtitle">{events.length} posts in your content plan</p>
        </div>
        <div className="calendar-actions">
          <div className="date-actions">
            <button onClick={() => setDate(new Date())}>Today</button>
            <button aria-label="Previous period" onClick={() => setDate(moment(date).subtract(1, view).toDate())}>&lsaquo;</button>
            <button aria-label="Next period" onClick={() => setDate(moment(date).add(1, view).toDate())}>&rsaquo;</button>
          </div>
          <div className="view-switcher">
            {Object.entries(viewLabels).map(([key, label]) => (
              <button key={key} className={view === key ? 'active' : ''} onClick={() => setView(key)}>{label}</button>
            ))}
          </div>
          <button className="add-post" onClick={() => openCreate()}>+ New post</button>
          <button className={`optimize-toggle ${calendarOptimization.enabled ? 'enabled' : ''} ${calendarOptimization.analyzing ? 'analyzing' : ''}`} onClick={toggleOptimization} aria-pressed={calendarOptimization.enabled}>
            <i aria-hidden="true" />{calendarOptimization.analyzing ? 'Analyzing...' : calendarOptimization.enabled ? 'Optimization on' : 'Optimize calendar'}
          </button>
        </div>
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
          view={view}
          date={date}
          onView={setView}
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
