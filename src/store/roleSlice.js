import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  roles: [],
  loading: false,
  error: null,
};

export const fetchRoles = createAsyncThunk("roles/fetchRoles", async () => {
  const response = await axios.get(
    "http://127.0.0.1:8000/api/definitions/roles/"
  );
  return response.data; // Returns array of { id, name, created_at, updated_at }
});

export const addRole = createAsyncThunk("roles/addRole", async (roleData) => {
  const response = await axios.post(
    "http://127.0.0.1:8000/api/definitions/roles/",
    roleData
  );
  return response.data; // Returns { id, name, created_at, updated_at }
});

export const editRole = createAsyncThunk(
  "roles/editRole",
  async ({ id, ...roleData }) => {
    const response = await axios.put(
      `http://127.0.0.1:8000/api/definitions/roles/${id}`,
      roleData
    );
    return response.data; // Returns updated role
  }
);

export const deleteRole = createAsyncThunk("roles/deleteRole", async (id) => {
  await axios.delete(`http://127.0.0.1:8000/api/definitions/roles/${id}`);
  return id;
});

const roleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addRole.fulfilled, (state, action) => {
        state.roles.push(action.payload);
      })
      .addCase(editRole.fulfilled, (state, action) => {
        const index = state.roles.findIndex(
          (role) => role.id === action.payload.id
        );
        if (index !== -1) state.roles[index] = action.payload;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter((role) => role.id !== action.payload);
      });
  },
});

export default roleSlice.reducer;
