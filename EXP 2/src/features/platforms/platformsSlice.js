import { createSlice, createEntityAdapter, nanoid } from '@reduxjs/toolkit';

const platformsAdapter = createEntityAdapter();

const initialState = platformsAdapter.getInitialState({}, [
  { id: 'p1', name: 'Instagram' },
  { id: 'p2', name: 'Twitter' },
]);

const platformsSlice = createSlice({
  name: 'platforms',
  initialState,
  reducers: {
    addPlatform: {
      reducer: platformsAdapter.addOne,
      prepare: (name) => ({ payload: { id: nanoid(), name } }),
    },
    updatePlatform: platformsAdapter.updateOne,
    deletePlatform: platformsAdapter.removeOne,
  },
});

export const { addPlatform, updatePlatform, deletePlatform } = platformsSlice.actions;

export const {
  selectAll: selectAllPlatforms,
  selectById: selectPlatformById,
} = platformsAdapter.getSelectors((state) => state.platforms);

export default platformsSlice.reducer;