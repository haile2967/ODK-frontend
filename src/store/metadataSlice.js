import { createSlice } from '@reduxjs/toolkit';
import metadataData from "../pages/dataProcessing/metadata.json";
const metadataSlice = createSlice({
  name: 'metadata',
  initialState: {
    metadata: metadataData,
    status: 'idle',
    error: null,
  },
  reducers: {
    setMetadata(state, action) {
      state.metadata = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    setError(state, action) {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

export const { setMetadata, setError } = metadataSlice.actions;
export default metadataSlice.reducer;