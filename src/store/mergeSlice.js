import { createSlice } from '@reduxjs/toolkit';

const mergeSlice = createSlice({
  name: 'merge',
  initialState: { mergedData: [] },
  reducers: {
    setMergedData: (state, action) => {
      state.mergedData = action.payload;
    },
  },
});

export const { setMergedData } = mergeSlice.actions;
export default mergeSlice.reducer;