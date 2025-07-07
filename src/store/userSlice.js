import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  users: [],
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  const response = await axios.get("http://127.0.0.1:8000/api/accounts/");
  return response.data;
});

export const addUser = createAsyncThunk("users/addUser", async (userData) => {
  console.log("Sending addUser request with data:", userData);
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/accounts/",
      userData
    );
    console.log("addUser response:", response.data);
    return response.data.user;
  } catch (error) {
    console.error(
      "addUser error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
});

export const editUser = createAsyncThunk(
  "users/editUser",
  async ({ user_id, ...userData }) => {
    const response = await axios.put(
      `http://127.0.0.1:8000/api/accounts/${user_id}`,
      userData
    );
    return response.data;
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (user_id) => {
    await axios.delete(`http://127.0.0.1:8000/api/accounts/${user_id}`);
    return user_id;
  }
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ||
          action.error.response?.data?.detail ||
          "Unknown error";
        console.error(
          "addUser rejected:",
          action.error.response?.data || action.error
        );
      })
      .addCase(editUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) state.users[index] = action.payload;
      })
      .addCase(editUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default userSlice.reducer;
