import { useEffect, useState } from 'react';
import { PostProvider } from './context/PostContext';
import CalendarView from './components/CalendarView';
import Sidebar from './components/Sidebar';
import './index.css';

export default function App() {
  const [darkTheme, setDarkTheme] = useState(() => localStorage.getItem('post-scheduler:theme') === 'dark');
  useEffect(() => { localStorage.setItem('post-scheduler:theme', darkTheme ? 'dark' : 'light'); }, [darkTheme]);
  return <PostProvider><div className={`app-shell ${darkTheme ? 'dark-theme' : ''}`}><header className="app-header"><div className="brand"><div className="brand-mark" aria-hidden="true">*</div><div><p className="eyebrow">Content operations</p><h1>Plan your publishing rhythm</h1></div></div><div className="header-controls"><p className="header-tip">Click an empty time slot to create a post. Drag posts to reschedule.</p><button className="theme-toggle" onClick={() => setDarkTheme((current) => !current)} aria-label="Toggle dark theme">{darkTheme ? 'Light mode' : 'Dark mode'}</button></div></header><main className="app-main"><CalendarView /><Sidebar /></main></div></PostProvider>;
}
