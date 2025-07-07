import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import formsData from "../pages/dataProcessing/forms.json";

const formSlice = createSlice({
  name: 'form',
  initialState: {
    forms: formsData,
    status: 'idle',
    error: null,
  },
  reducers: {
    setForms(state, action) {
      state.forms = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    addForm(state, action) {
      state.forms.push(action.payload);
      state.status = 'succeeded';
      state.error = null;
    },
    updateForm(state, action) {
      const { project_id, form_id } = action.payload;
      const index = state.forms.findIndex(
        (form) => form.project_id === project_id && form.form_id === form_id
      );
      if (index !== -1) {
        state.forms[index] = action.payload;
        state.status = 'succeeded';
        state.error = null;
      } else {
        state.error = 'Form not found';
        state.status = 'failed';
      }
    },
    deleteForm(state, action) {
      const { project_id, form_id } = action.payload;
      state.forms = state.forms.filter(
        (form) => !(form.project_id === project_id && form.form_id === form_id)
      );
      state.status = 'succeeded';
      state.error = null;
    },
    setError(state, action) {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

// Thunk to handle deletion with usage check
export const deleteFormWithCheck = createAsyncThunk(
  'form/deleteFormWithCheck',
  async (payload, { dispatch, getState }) => {
    const { project_id, form_id } = payload;
    const state = getState();

    // Check if form is in use in metadata, team, or dfa
    const isUsedInMetadata = state.metadata?.metadata?.some(
      (item) => item.project_id === project_id && item.form_id === form_id
    );
    const isUsedInTeam = state.team?.team?.some(
      (item) => item.project_id === project_id && item.form_id === form_id
    );
    const isUsedInDfa = state.dfa?.dfa?.some(
      (item) => item.project_id === project_id && item.form_id === form_id
    );

    if (isUsedInMetadata || isUsedInTeam || isUsedInDfa) {
      dispatch(setError('Cannot delete form: It is in use in metadata, team data, or DFA data.'));
      return;
    }

    // Proceed with deletion if not in use
    dispatch(deleteForm({ project_id, form_id }));
  }
);

export const { setForms, addForm, updateForm, deleteForm, setError } = formSlice.actions;
export default formSlice.reducer;