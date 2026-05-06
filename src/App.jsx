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

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Login />} />

        {/* ================= ADMIN ROUTES ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assets"
          element={
            <ProtectedRoute role="Admin">
              <Assets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assign"
          element={
            <ProtectedRoute role="Admin">
              <AssignAsset />
            </ProtectedRoute>
          }
        />

        <Route
          path="/updateticket"
          element={
            <ProtectedRoute role="Admin">
              <UpdateTicket />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute role="Admin">
              <Upload />
            </ProtectedRoute>
          }
        />

        {/* ================= EMPLOYEE ROUTES ================= */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute role="Employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets"
          element={
            <ProtectedRoute role="Employee">
              <Tickets />
            </ProtectedRoute>
          }
        />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;