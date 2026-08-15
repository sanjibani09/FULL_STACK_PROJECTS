import { describe, expect, it } from 'vitest';
import { ACTIONS, postReducer } from './postReducer';

const initialPost = {
  id: 'post-1',
  title: 'Original post',
  platform: 'Instagram',
  start: new Date('2026-08-20T09:00:00'),
  end: new Date('2026-08-20T09:30:00'),
  preferredStart: new Date('2026-08-20T09:00:00'),
};

describe('postReducer', () => {
  it('updates only the matching post', () => {
    const state = [initialPost, { ...initialPost, id: 'post-2', title: 'Unchanged' }];
    const nextState = postReducer(state, { type: ACTIONS.UPDATE_POST, payload: { id: 'post-1', title: 'Updated post' } });

    expect(nextState[0]).toMatchObject({ id: 'post-1', title: 'Updated post' });
    expect(nextState[1]).toBe(state[1]);
  });

  it('reschedules a post while preserving its preferred start time', () => {
    const start = new Date('2026-08-21T11:00:00');
    const end = new Date('2026-08-21T11:30:00');
    const nextState = postReducer([initialPost], { type: ACTIONS.RESCHEDULE_POST, payload: { id: 'post-1', start, end } });

    expect(nextState[0]).toMatchObject({ start, end, preferredStart: initialPost.start });
  });

  it('removes a deleted post', () => {
    expect(postReducer([initialPost], { type: ACTIONS.DELETE_POST, payload: { id: 'post-1' } })).toEqual([]);
  });
});
