import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { loginUser, clearError, setError } from "../store/authSlice";
import { companyLogo, backgroundImage } from "./config";
import "./login.css"; // Import the CSS file
import { message } from "antd";

const Login = () => {
  const { status, error } = useSelector((state) => state.auth);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleTraditionalLogin = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    if (!username || !password) {
      dispatch(setError("Please fill in all fields"));
      return;
    }

    try {
      await dispatch(loginUser({ username, password })).unwrap();
      navigate("/");
    } catch (err) {
      // Error is already set by the rejected action
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo and Heading */}
        <div className="login-header">
          <img src={companyLogo} alt="AIS Logo" className="login-logo" />
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Please sign in to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleTraditionalLogin} className="login-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              value={username}
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter your password"
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="remember-forgot">
            <label className="remember-me">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span>Remember me</span>
            </label>
            <a href="/forgot-password" className="forgot-password">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
