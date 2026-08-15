export const ACTIONS = {
  ADD_POST: 'ADD_POST',
  UPDATE_POST: 'UPDATE_POST',
  DELETE_POST: 'DELETE_POST',
  RESCHEDULE_POST: 'RESCHEDULE_POST',
  LOAD_POSTS: 'LOAD_POSTS',
};

export function postReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOAD_POSTS:
      return action.payload;
    case ACTIONS.ADD_POST:
      return [...state, action.payload];
    case ACTIONS.UPDATE_POST:
      return state.map((p) =>
        p.id === action.payload.id ? { ...p, ...action.payload } : p
      );
    case ACTIONS.DELETE_POST:
      return state.filter((p) => p.id !== action.payload.id);
    case ACTIONS.RESCHEDULE_POST:
      return state.map((p) =>
        p.id === action.payload.id
          ? { ...p, start: action.payload.start, end: action.payload.end, preferredStart: action.payload.preferredStart || p.preferredStart }
          : p
      );
    default:
      return state;
  }
}
