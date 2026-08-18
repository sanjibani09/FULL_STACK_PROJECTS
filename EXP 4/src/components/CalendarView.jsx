import { memo, useCallback, useMemo, useState } from 'react';
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

function CalendarView() {
  const { posts, reschedulePost, updatePost, deletePost, addPost } = usePosts();
  const { setScheduleInsight } = useScheduleInsight();
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const events = useMemo(() => posts.map((post) => ({ ...post, title: post.title })), [posts]);

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
        />
      </div>
      {modalMode && <PostModal post={selectedPost} mode={modalMode} onClose={closeModal} onSave={handleSave} onDelete={deleteAndClose} />}
    </section>
  );
}

export default memo(CalendarView);