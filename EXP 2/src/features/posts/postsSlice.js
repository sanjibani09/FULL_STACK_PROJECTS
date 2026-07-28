import { createSlice, createEntityAdapter, nanoid } from '@reduxjs/toolkit';

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

export default postsSlice.reducer;