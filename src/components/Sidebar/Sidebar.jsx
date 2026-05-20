import { NavLink, useNavigate } from "react-router-dom";

import { NAVIGATION_CONFIG, ROUTES } from "../../constants";
import { getUser, logout } from "../../utils";

import "./Sidebar.css";

function getInitials(username) {
  if (!username) return "??";
  return username.slice(0, 2).toUpperCase();
}

function Sidebar({ role = "Admin" }) {
  const navigate = useNavigate();
  const user = getUser();
  const navItems = NAVIGATION_CONFIG[role] || NAVIGATION_CONFIG.Admin;
  const initials = getInitials(user?.username);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          Asset<span>Manage</span>
        </div>
        <div className="brand-sub">IT Asset Management</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div className="nav-group" key={section.section}>
            <div className="nav-section">{section.section}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                <i className={`fas ${item.icon}`} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.username || "User"}</div>
            <div className="user-role">{role}</div>
          </div>
        </div>

        <button type="button" className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-right-from-bracket" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
