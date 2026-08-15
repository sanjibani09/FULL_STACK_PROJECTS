import { useCallback, useMemo, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import dndModule from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { usePosts } from '../context/PostContext';
import { getSchedulingInsight } from '../data/schedulingInsights';
import PostModal from './PostModal';

const localizer = momentLocalizer(moment);
const DnDCalendar = (dndModule.default || dndModule)(Calendar);
const viewLabels = { month: 'Month', week: 'Week', day: 'Day' };

export default function CalendarView() {
  const { posts, reschedulePost, updatePost, deletePost, addPost, setScheduleInsight } = usePosts();
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const events = useMemo(() => posts.map((post) => ({ ...post, title: post.title })), [posts]);
  const openCreate = useCallback((start = new Date()) => { const end = new Date(start); end.setMinutes(end.getMinutes() + 30); setSelectedPost({ id: null, title: '', platform: 'Instagram', status: 'draft', start, end, notes: '' }); setModalMode('create'); }, []);
  const closeModal = () => { setModalMode(null); setSelectedPost(null); };
  const handleSave = (post) => { modalMode === 'create' ? addPost({ ...post, id: crypto.randomUUID(), preferredStart: post.start }) : updatePost(post); closeModal(); };
  const assessMove = ({ event, start, end, allDay }) => {
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
    setScheduleInsight(getSchedulingInsight(eventWithPreference, newStart, posts));
  };

  const handleDragStart = ({ event }) => setScheduleInsight(getSchedulingInsight(event, event.start, posts));
  const eventPropGetter = useCallback((event) => ({ style: { backgroundColor: event.color || '#6d5dfc', borderRadius: '6px', opacity: event.status === 'published' ? .7 : 1, color: 'white' } }), []);
  const title = moment(date).format(view === 'day' ? 'dddd, D MMMM' : 'MMMM YYYY');
  return <section className="calendar-wrapper" aria-label="Post scheduling calendar"><div className="calendar-toolbar"><div><h2 className="calendar-title">{title}</h2><p className="calendar-subtitle">{events.length} posts in your content plan</p></div><div className="calendar-actions"><div className="date-actions"><button onClick={() => setDate(new Date())}>Today</button><button aria-label="Previous period" onClick={() => setDate(moment(date).subtract(1, view).toDate())}>&lsaquo;</button><button aria-label="Next period" onClick={() => setDate(moment(date).add(1, view).toDate())}>&rsaquo;</button></div><div className="view-switcher">{Object.entries(viewLabels).map(([key, label]) => <button key={key} className={view === key ? 'active' : ''} onClick={() => setView(key)}>{label}</button>)}</div><button className="add-post" onClick={() => openCreate()}>+ New post</button></div></div><div className="calendar-body"><DnDCalendar localizer={localizer} events={events} startAccessor="start" endAccessor="end" selectable resizable popup toolbar={false} step={15} timeslots={4} longPressThreshold={150} view={view} date={date} onView={setView} onNavigate={setDate} onDragStart={handleDragStart} onEventDrop={assessMove} onEventResize={assessMove} onSelectEvent={(event) => { setSelectedPost(event); setModalMode('edit'); }} onSelectSlot={({ start }) => openCreate(start)} eventPropGetter={eventPropGetter} /></div>{modalMode && <PostModal post={selectedPost} mode={modalMode} onClose={closeModal} onSave={handleSave} onDelete={(id) => { deletePost(id); closeModal(); }} />}</section>;
}
