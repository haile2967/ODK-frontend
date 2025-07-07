import React from "react";
import { Navigate, Route, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../../pages/tokenMiddleware";
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { accessToken } = useSelector((state) => state.auth);

  if (!accessToken) {
    // Redirect to login page but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
/*

const ProtectedRoute = ({ element, allowedRoles, ...rest }) => {
  const { user } = useAuth();
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const hasAccess = user && (!allowedRoles || allowedRoles.includes(user.role));
  console.log('hasAccess', hasAccess);
  console.log('allowedRoles', allowedRoles);
  console.log('user.role', user.role);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !hasAccess) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // If authenticated and has access, render the element
  return <Route {...rest} element={element} />;
};

export default ProtectedRoute;
*/
