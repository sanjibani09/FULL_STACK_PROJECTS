import { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { postReducer, ACTIONS } from './postReducer';
import { seedPosts } from '../data/samplePosts';

const STORAGE_KEY = 'post-scheduler:posts';
const PostContext = createContext(null);

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  const addPost = (post) => dispatch({ type: ACTIONS.ADD_POST, payload: post });
  const updatePost = (post) => dispatch({ type: ACTIONS.UPDATE_POST, payload: post });
  const deletePost = (id) => dispatch({ type: ACTIONS.DELETE_POST, payload: { id } });
  const reschedulePost = (id, start, end, preferredStart) =>
    dispatch({ type: ACTIONS.RESCHEDULE_POST, payload: { id, start, end, preferredStart } });

  return (
    <PostContext.Provider value={{ posts, addPost, updatePost, deletePost, reschedulePost, scheduleInsight, setScheduleInsight }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostContext);
  if (!ctx) throw new Error('usePosts must be used inside <PostProvider>');
  return ctx;
}
