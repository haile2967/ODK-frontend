import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../pages/config.jsx";
import axios from "axios";
import { setError as setReduxError } from "./errorSlice.jsx";
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      console.log("credentials", credentials);
      const response = await axios.post(
        `http://localhost:8000/api/account/login`,
        new URLSearchParams({
          username: credentials.username,
          password: credentials.password,
          grant_type: "",
          scope: "",
          client_id: "",
          client_secret: "",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            accept: "application/json", // Also added this header which is present in Swagger
          },
        }
      );
/*       const response = await axios.post(
        `http://localhost:8000/api/account/login`,
        {
          username: credentials.username,
          password: credentials.password,
          scope: null,
          client_id: null,
          client_secret: null,
        }
      ); */
      const { access_token, refresh_token } = response.data;
      return { accessToken: access_token, refreshToken: refresh_token };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (username, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/Account/request-password-reset`,
        { username }
      );
      return response.data;
    } catch (error) {
      dispatch(
        setReduxError(
          error.response?.data?.message || "Failed to send reset password email"
        )
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to send reset password email"
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ userName, token, newPassword }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/Account/reset-password`,
        { userName, token, newPassword }
      );
      return response.data;
    } catch (error) {
      dispatch(
        setReduxError(
          error.response?.data?.message || "Failed to reset password"
        )
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to reset password"
      );
    }
  }
);
// Add this in your slice file where other thunks are defined
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    { currentPassword, newPassword },
    { getState, rejectWithValue, dispatch }
  ) => {
    try {
      const { accessToken } = getState().auth;
      if (!accessToken) {
        dispatch(setReduxError("Session expired. Please log in again."));
        return rejectWithValue("Session expired. Please log in again.");
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/Account/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      dispatch(
        setReduxError(
          error.response?.data?.message || "Failed to change password"
        )
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to change password"
      );
    }
  }
);
// Async thunk for token refresh
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (refreshToken, { rejectWithValue, getState }) => {
    try {
      const response = await axios.post("/api/refresh", {
        refresh_token: refreshToken,
      });
      const { access_token, refresh_token } = response.data;
      return { accessToken: access_token, refreshToken: refresh_token };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Token refresh failed"
      );
    }
  }
);

const initialState = {
  accessToken: localStorage.getItem("accessToken") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  expiresAt: localStorage.getItem("expiresAt") || null,
  forgotPasswordStatus: "idle", 
  resetPasswordStatus: "idle",
  changePasswordStatus: "idle", 
  status: "idle",
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("expiresAt");
      state.accessToken = null;
      state.refreshToken = null;
      state.expiresAt = null;
      state.status = "idle";
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearAuthStatus: (state) => {
      state.forgotPasswordStatus = "idle";
      state.resetPasswordStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { accessToken, refreshToken } = action.payload;
        const decoded = decodeJwt(accessToken);
        const expiresAt = decoded.exp * 1000;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("expiresAt", expiresAt);

        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.expiresAt = expiresAt;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Token refresh cases
      .addCase(refreshToken.pending, (state) => {
        state.status = "refreshing";
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        const { accessToken, refreshToken } = action.payload;
        const decoded = decodeJwt(accessToken);
        const expiresAt = decoded.exp * 1000;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("expiresAt", expiresAt);

        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.expiresAt = expiresAt;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        // Auto-logout on refresh failure
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("expiresAt");
        state.accessToken = null;
        state.refreshToken = null;
        state.expiresAt = null;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPasswordStatus = "loading";
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.forgotPasswordStatus = "succeeded";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordStatus = "failed";
        state.error = action.payload;
      })
      .addCase(changePassword.pending, (state) => {
        state.changePasswordStatus = "loading";
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.changePasswordStatus = "succeeded";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changePasswordStatus = "failed";
        state.error = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.resetPasswordStatus = "loading";
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetPasswordStatus = "succeeded";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordStatus = "failed";
        state.error = action.payload;
      });
  },
});
// Helper function to decode JWT
function decodeJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64));
  } catch (e) {
    return null;
  }
}

export const { logout, clearError, setError, clearAuthStatus } = authSlice.actions;
export default authSlice.reducer;
