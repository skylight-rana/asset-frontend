import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth";

import "./EmployeeNavbar.css";

function EmployeeNavbar() {

  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="nav">

      {/* LINKS */}
      <div className="nav-links">
        <NavLink to="/employee">Dashboard</NavLink>
        <NavLink to="/tickets">Raise / Track Tickets</NavLink>
      </div>

      {/* LOGOUT */}
      <button
        type="button"
        onClick={handleLogout}
        className="logout-btn"
      >
        Logout
      </button>

    </nav>
  );
}

export default EmployeeNavbar;