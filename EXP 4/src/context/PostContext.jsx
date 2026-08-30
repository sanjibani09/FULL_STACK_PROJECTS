import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { postReducer, ACTIONS } from './postReducer';
import { seedPosts } from '../data/samplePosts';

const STORAGE_KEY = 'post-scheduler:posts';
const PostContext = createContext(null);
const ScheduleInsightContext = createContext(null);

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedPosts;
    const parsed = JSON.parse(raw);
    return parsed.map((p) => ({
      ...p,
      start: new Date(p.start),
      end: new Date(p.end),
    }));
  } catch {
    return seedPosts;
  }
}

export function PostProvider({ children }) {
  const [posts, dispatch] = useReducer(postReducer, undefined, loadInitial);
  const [scheduleInsight, setScheduleInsight] = useState(null);
  const [calendarOptimization, setCalendarOptimization] = useState({ enabled: false, analyzing: false, results: [], summary: null });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  const addPost = useCallback((post) => dispatch({ type: ACTIONS.ADD_POST, payload: post }), []);
  const updatePost = useCallback((post) => dispatch({ type: ACTIONS.UPDATE_POST, payload: post }), []);
  const deletePost = useCallback((id) => dispatch({ type: ACTIONS.DELETE_POST, payload: { id } }), []);
  const reschedulePost = useCallback((id, start, end, preferredStart) =>
    dispatch({ type: ACTIONS.RESCHEDULE_POST, payload: { id, start, end, preferredStart } }), []);

  const postsValue = useMemo(() => ({ posts, addPost, updatePost, deletePost, reschedulePost }), [posts, addPost, updatePost, deletePost, reschedulePost]);
  const insightValue = useMemo(() => ({ scheduleInsight, setScheduleInsight, calendarOptimization, setCalendarOptimization }), [calendarOptimization, scheduleInsight]);

  return (
    <PostContext.Provider value={postsValue}>
      <ScheduleInsightContext.Provider value={insightValue}>{children}</ScheduleInsightContext.Provider>
    </PostContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostContext);
  if (!ctx) throw new Error('usePosts must be used inside <PostProvider>');
  return ctx;
}

export function useScheduleInsight() {
  const ctx = useContext(ScheduleInsightContext);
  if (!ctx) throw new Error('useScheduleInsight must be used inside <PostProvider>');
  return ctx;
}
