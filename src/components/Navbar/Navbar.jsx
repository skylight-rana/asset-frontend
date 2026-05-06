import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth";
import "./Navbar.css";

function Navbar() {

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
        <NavLink to="/admin">Dashboard</NavLink>
        <NavLink to="/assets">Assets</NavLink>
        <NavLink to="/assign">Assign</NavLink>
        <NavLink to="/updateticket">Update Ticket</NavLink>
        <NavLink to="/upload">Upload</NavLink>
      </div>

      {/* LOGOUT */}
      <button
        type="button"
        className="logout-btn"
        onClick={handleLogout}
      >
        Logout
      </button>

    </nav>
  );
}

export default Navbar;