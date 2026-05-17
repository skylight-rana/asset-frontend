import { Navigate } from "react-router-dom";
import { getUser } from "./auth";
import { ROUTES } from "../constants/routes";

function ProtectedRoute({ children, role }) {
  const user = getUser();

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (role && user.role !== role) {
    return (
      <Navigate
        to={user.role === "Admin" ? ROUTES.ADMIN_DASHBOARD : ROUTES.EMPLOYEE_DASHBOARD}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;