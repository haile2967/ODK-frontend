// store/slices/errorSlice.js
import { createSlice } from "@reduxjs/toolkit";

const errorSlice = createSlice({
  name: "globalError",
  initialState: {
    lastError: null,
    errorTpe: null,
    shownErrors: new Set(), // Optional: for throttling repeated messages
  },
  reducers: {
    setError: (state, action) => {
      const id = action.payload?.id || action.payload?.message || Date.now();
      if (!state.shownErrors.has(id)) {
        state.lastError = action.payload;
        state.shownErrors.add(id);
      }
    },
    clearError: (state) => {
      state.lastError = null;
    },
    resetErrors: (state) => {
      state.shownErrors = new Set();
    },
  },
});
export const { setError, clearError, resetErrors } = errorSlice.actions;
export default errorSlice.reducer;
