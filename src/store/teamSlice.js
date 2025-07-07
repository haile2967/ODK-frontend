import { createSlice } from '@reduxjs/toolkit';
import teamData from '../pages/dataProcessing/team.json';

const teamSlice = createSlice({
  name: 'team',
  initialState: { team: teamData },
  reducers: {
    setTeam: (state, action) => {
      state.team = action.payload;
    },
  },
});

export const { setTeam } = teamSlice.actions;
export default teamSlice.reducer;