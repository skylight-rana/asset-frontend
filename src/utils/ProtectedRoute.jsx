import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // If not logged in
  if (!user) {
    return <Navigate to="/" />;
  }

  // Role check
  if (role && user.role !== role) {

    // Admin trying employee page
    if (user.role === "Admin") {
      return <Navigate to="/admin" />;
    }

    // Employee trying admin page
    return <Navigate to="/employee" />;
  }

  // Allow access
  return children;
}

export default ProtectedRoute;