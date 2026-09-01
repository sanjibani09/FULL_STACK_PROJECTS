import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import { usePosts, useScheduleInsight } from '../context/PostContext';
import { getSchedulingInsight } from '../data/schedulingInsights';
import PostModal from './PostModal';

moment.updateLocale('en', { week: { dow: 1, doy: 4 } });

function sameDay(first, second) {
  return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth() && first.getDate() === second.getDate();
}

function buildOptimization(posts, previousResults = []) {
  const previousById = new Map(previousResults.map((result) => [result.id, result]));
  const results = posts.map((post) => {
    const next = getSchedulingInsight(post, post.start, posts, post.end);
    const previous = previousById.get(post.id);
    const unchanged = previous && previous.preference === next.preference && previous.score === next.score && previous.conflicts.map((item) => item.id).join() === next.conflicts.map((item) => item.id).join();
    return unchanged ? previous : next;
  });
  return { results, summary: { average: results.length ? Math.round(results.reduce((total, result) => total + result.preference, 0) / results.length) : 0, great: results.filter((result) => result.score === 'great').length, fair: results.filter((result) => result.score === 'fair').length, poor: results.filter((result) => result.score === 'poor').length } };
}

const DaySchedule = memo(function DaySchedule({ day, optimized, onAdd, onEdit, onDrop }) {
  return <article className={`day-schedule-card ${sameDay(day.date, new Date()) ? 'today' : ''}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => onDrop(event, day.date)}>
    <button className="day-schedule-header" onClick={() => onAdd(day.date)}><span>{day.label}</span><strong>{day.number}</strong>{optimized && <b className={day.score >= 78 ? 'great' : day.score >= 55 ? 'fair' : 'poor'}>{day.score === null ? '--' : `${day.score}%`}</b>}</button>
    <div className="day-post-list">
      {day.posts.length ? day.posts.map((post) => <button key={post.id} className="day-post" draggable onDragStart={(event) => { event.dataTransfer.setData('text/post-id', post.id); event.dataTransfer.effectAllowed = 'move'; }} onClick={() => onEdit(post)} style={{ '--post-color': post.color }}><time>{new Date(post.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time><span>{post.title}</span>{optimized && post.score !== undefined && <b>{post.score}</b>}</button>) : <button className="empty-day" onClick={() => onAdd(day.date)}>+ Schedule post</button>}
    </div>
    <small className="drop-hint">Drop a post here</small>
  </article>;
}, (previous, next) => previous.optimized === next.optimized && previous.day.score === next.day.score && previous.day.posts.length === next.day.posts.length && previous.day.posts.every((post, index) => post === next.day.posts[index] && post.score === next.day.posts[index].score));

function CalendarView() {
  const { posts, reschedulePost, updatePost, deletePost, addPost } = usePosts();
  const { setScheduleInsight, calendarOptimization, setCalendarOptimization } = useScheduleInsight();
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [date, setDate] = useState(new Date());
  const postsRef = useRef(posts);
  const optimizationTimer = useRef(null);
  useEffect(() => { postsRef.current = posts; }, [posts]);
  useEffect(() => () => window.clearTimeout(optimizationTimer.current), []);

  const visiblePosts = useMemo(() => {
    const start = moment(date).startOf('isoWeek').toDate();
    const end = moment(date).endOf('isoWeek').toDate();
    return posts.filter((post) => new Date(post.start) <= end && new Date(post.end) >= start);
  }, [date, posts]);
  const optimizationById = useMemo(() => new Map(calendarOptimization.results.map((result) => [result.id, result])), [calendarOptimization.results]);
  useEffect(() => {
    if (!calendarOptimization.enabled || calendarOptimization.analyzing) return;
    const { results, summary } = buildOptimization(visiblePosts, calendarOptimization.results);
    setCalendarOptimization({ enabled: true, analyzing: false, results, summary });
  }, [calendarOptimization.analyzing, calendarOptimization.enabled, setCalendarOptimization, visiblePosts]);

  const weekDays = useMemo(() => {
    const start = moment(date).startOf('isoWeek');
    return Array.from({ length: 7 }, (_, index) => {
      const momentDay = start.clone().add(index, 'days');
      const dayDate = momentDay.toDate();
      const dayPosts = visiblePosts.filter((post) => sameDay(new Date(post.start), dayDate)).map((post) => ({ ...post, score: calendarOptimization.enabled && !calendarOptimization.analyzing ? optimizationById.get(post.id)?.preference : undefined })).sort((first, second) => new Date(first.start) - new Date(second.start));
      const scores = dayPosts.map((post) => post.score).filter(Number.isFinite);
      return { key: momentDay.format('YYYY-MM-DD'), date: dayDate, label: momentDay.format('ddd'), number: momentDay.format('D'), posts: dayPosts, score: scores.length ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length) : null };
    });
  }, [calendarOptimization.analyzing, calendarOptimization.enabled, date, optimizationById, visiblePosts]);

  const closeModal = useCallback(() => { setModalMode(null); setSelectedPost(null); }, []);
  const openCreate = useCallback((dayDate = new Date()) => { const start = new Date(dayDate); start.setHours(9, 0, 0, 0); const end = new Date(start); end.setMinutes(end.getMinutes() + 30); setSelectedPost({ id: null, title: '', platform: 'Instagram', status: 'draft', start, end, notes: '' }); setModalMode('create'); }, []);
  const openEdit = useCallback((post) => { setSelectedPost(post); setModalMode('edit'); }, []);
  const handleSave = useCallback((post) => { const finalPost = modalMode === 'create' ? { ...post, id: crypto.randomUUID(), preferredStart: post.start } : post; if (modalMode === 'create') addPost(finalPost); else updatePost(finalPost); setScheduleInsight(getSchedulingInsight(finalPost, finalPost.start, postsRef.current, finalPost.end)); closeModal(); }, [addPost, closeModal, modalMode, setScheduleInsight, updatePost]);
  const dropPostOnDay = useCallback((event, dayDate) => {
    event.preventDefault();
    const post = postsRef.current.find((item) => item.id === event.dataTransfer.getData('text/post-id'));
    if (!post) return;
    const oldStart = new Date(post.start); const oldEnd = new Date(post.end); const newStart = new Date(dayDate);
    newStart.setHours(oldStart.getHours(), oldStart.getMinutes(), 0, 0);
    if (sameDay(oldStart, newStart)) return;
    const newEnd = new Date(newStart.getTime() + (oldEnd.getTime() - oldStart.getTime()));
    const withPreference = { ...post, preferredStart: post.preferredStart || oldStart };
    const prospectivePosts = postsRef.current.map((item) => item.id === post.id ? { ...item, start: newStart, end: newEnd } : item);
    reschedulePost(post.id, newStart, newEnd, withPreference.preferredStart);
    setScheduleInsight(getSchedulingInsight(withPreference, newStart, prospectivePosts, newEnd));
  }, [reschedulePost, setScheduleInsight]);
  const toggleOptimization = useCallback(() => { if (calendarOptimization.enabled) { window.clearTimeout(optimizationTimer.current); setCalendarOptimization({ enabled: false, analyzing: false, results: [], summary: null }); return; } setCalendarOptimization({ enabled: true, analyzing: true, results: [], summary: null }); optimizationTimer.current = window.setTimeout(() => { const { results, summary } = buildOptimization(visiblePosts); setCalendarOptimization({ enabled: true, analyzing: false, results, summary }); }, 500); }, [calendarOptimization.enabled, setCalendarOptimization, visiblePosts]);
  const title = useMemo(() => { const start = moment(date).startOf('isoWeek'); const end = moment(date).endOf('isoWeek'); return start.month() === end.month() ? `${start.format('D')} - ${end.format('D MMMM YYYY')}` : `${start.format('D MMM')} - ${end.format('D MMM YYYY')}`; }, [date]);

  return <section className="calendar-wrapper" aria-label="Seven-day post planner"><div className="calendar-toolbar"><div><h2 className="calendar-title">{title}</h2><p className="calendar-subtitle">{visiblePosts.length} posts in this 7-day plan</p></div><div className="calendar-actions"><div className="date-actions"><button onClick={() => setDate(new Date())}>Today</button><button aria-label="Previous week" onClick={() => setDate(moment(date).subtract(1, 'week').toDate())}>&lsaquo;</button><button aria-label="Next week" onClick={() => setDate(moment(date).add(1, 'week').toDate())}>&rsaquo;</button></div><button className="add-post" onClick={() => openCreate()}>+ New post</button><button className={`optimize-toggle ${calendarOptimization.enabled ? 'enabled' : ''} ${calendarOptimization.analyzing ? 'analyzing' : ''}`} onClick={toggleOptimization} aria-pressed={calendarOptimization.enabled}><i aria-hidden="true" />{calendarOptimization.analyzing ? 'Analyzing...' : calendarOptimization.enabled ? 'Optimization on' : 'Optimize calendar'}</button></div></div><div className="week-schedule-grid">{weekDays.map((day) => <DaySchedule key={day.key} day={day} optimized={calendarOptimization.enabled && !calendarOptimization.analyzing} onAdd={openCreate} onEdit={openEdit} onDrop={dropPostOnDay} />)}</div>{modalMode && <PostModal post={selectedPost} mode={modalMode} onClose={closeModal} onSave={handleSave} onDelete={(id) => { deletePost(id); closeModal(); }} />}</section>;
}

export default memo(CalendarView);
