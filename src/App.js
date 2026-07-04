import React from "react";
import { useSelector } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
/*  Public routes  */
import Login from "./pages/loginPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AppLayout from "./layouts/AppLayout"; // New layout wrapper
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { DoseProvider } from "./pages/reports/DoseContext";
import { allAppRoutes } from "./routes/index.js";

function App() {
  const { darkMode } = useSelector((state) => state.ui);
  return (
    <div className={darkMode ? "dark" : ""}>
      <Router>
        <DoseProvider> {/* Move DoseProvider here to wrap Routes */}
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected route with layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Private app routes */}
              {allAppRoutes.map(({ path, element }, index) => (
                <Route key={index} path={path} element={element} />
              ))}
            </Route>
          </Routes>
        </DoseProvider>
      </Router>
    </div>
  );
}

export default App;