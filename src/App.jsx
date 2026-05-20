import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ROUTES } from "./constants";
import {
  AdminDashboard,
  Assets,
  AssignAsset,
  EmployeeDashboard,
  Login,
  Tickets,
  UpdateTicket,
  Upload,
  Users,
} from "./pages";
import ProtectedRoute from "./utils/ProtectedRoute";

function protectedPage(role, Component) {
  return (
    <ProtectedRoute role={role}>
      <Component />
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login />} />

        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={protectedPage("Admin", AdminDashboard)}
        />
        <Route
          path={ROUTES.ADMIN_ASSETS}
          element={protectedPage("Admin", Assets)}
        />
        <Route
          path={ROUTES.ADMIN_ASSIGNMENTS}
          element={protectedPage("Admin", AssignAsset)}
        />
        <Route
          path={ROUTES.ADMIN_TICKETS}
          element={protectedPage("Admin", UpdateTicket)}
        />
        <Route
          path={ROUTES.ADMIN_DOCUMENTS}
          element={protectedPage("Admin", Upload)}
        />
        <Route
          path={ROUTES.ADMIN_USERS}
          element={protectedPage("Admin", Users)}
        />

        <Route
          path={ROUTES.EMPLOYEE_DASHBOARD}
          element={protectedPage("Employee", EmployeeDashboard)}
        />
        <Route
          path={ROUTES.EMPLOYEE_TICKETS}
          element={protectedPage("Employee", Tickets)}
        />

        <Route path="*" element={<Navigate to={ROUTES.LOGIN} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
