import { createSlice, createEntityAdapter, createSelector, nanoid } from '@reduxjs/toolkit';

const postsAdapter = createEntityAdapter();

const initialState = postsAdapter.getInitialState({}, [
  { id: '1', title: 'First Post', content: 'Hello Redux Toolkit!', platformId: 'p1' },
  { id: '2', title: 'Second Post', content: 'Normalized state is powerful.', platformId: 'p2' },
]);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    addPost: {
      reducer: postsAdapter.addOne,
      prepare: ({ title, content, platformId }) => ({
        payload: { id: nanoid(), title, content, platformId },
      }),
    },
    updatePost: postsAdapter.updateOne,   
    deletePost: postsAdapter.removeOne,   
  },
});

export const { addPost, updatePost, deletePost } = postsSlice.actions;


export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
} = postsAdapter.getSelectors((state) => state.posts);

// Derived state belongs in selectors rather than in the Redux store. These
// selectors keep their previous result until one of their inputs changes.
export const selectPostsByPlatform = createSelector(
  [selectAllPosts, (_, platformId) => platformId],
  (posts, platformId) => posts.filter((post) => post.platformId === platformId),
);

export const selectPostsGroupedByPlatform = createSelector(
  [selectAllPosts],
  (posts) => posts.reduce((groups, post) => {
    const postsForPlatform = groups[post.platformId] ?? [];
    groups[post.platformId] = [...postsForPlatform, post];
    return groups;
  }, {}),
);

export default postsSlice.reducer;
