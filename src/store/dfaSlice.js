import { createSlice } from '@reduxjs/toolkit';
import dfaData from "../pages/dataProcessing/dfa.json";

const dfaSlice = createSlice({
  name: 'dfa',
  initialState: { dfa: dfaData },
  reducers: {
    setDfa: (state, action) => {
      state.dfa = action.payload;
    },
  },
});

export const { setDfa } = dfaSlice.actions;
export default dfaSlice.reducer;