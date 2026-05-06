import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // If NOT logged in → redirect
  if (!user) {
    return <Navigate to="/" />;
  }

  // If logged in → show page
  return children;
}

export default ProtectedRoute;