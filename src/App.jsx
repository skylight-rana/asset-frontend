import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import EmployeeDashboard from "./pages/Employee/EmployeeDashboard";
import ProtectedRoute from "./utils/ProtectedRoute";

import Assets from "./pages/Assets/Assets";
import AssignAsset from "./pages/AssignAsset/AssignAsset";
import Tickets from "./pages/Tickets/Tickets";
import Upload from "./pages/Upload/Upload";
import UpdateTicket from "./pages/UpdateTicket/UpdateTicket";

import { ROUTES } from "./constants/routes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login />} />

        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <ProtectedRoute role="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ADMIN_ASSETS}
          element={
            <ProtectedRoute role="Admin">
              <Assets />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ADMIN_ASSIGNMENTS}
          element={
            <ProtectedRoute role="Admin">
              <AssignAsset />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ADMIN_TICKETS}
          element={
            <ProtectedRoute role="Admin">
              <UpdateTicket />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ADMIN_DOCUMENTS}
          element={
            <ProtectedRoute role="Admin">
              <Upload />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.EMPLOYEE_DASHBOARD}
          element={
            <ProtectedRoute role="Employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.EMPLOYEE_TICKETS}
          element={
            <ProtectedRoute role="Employee">
              <Tickets />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={ROUTES.LOGIN} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;