import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../utils/auth";
import "./Sidebar.css";

// Admin nav items
const ADMIN_NAV = [
  { section: "Overview", items: [
    { to: "/admin", end: true, icon: "fa-house", label: "Dashboard" },
  ]},
  { section: "Asset Management", items: [
    { to: "/assets",       icon: "fa-box",    label: "Assets" },
    { to: "/assign",       icon: "fa-link",   label: "Assignments" },
    { to: "/upload",       icon: "fa-file",   label: "Documents" },
  ]},
  { section: "Support", items: [
    { to: "/updateticket", icon: "fa-ticket", label: "Tickets" },
  ]},
];

// Employee nav items
const EMPLOYEE_NAV = [
  { section: "My Workspace", items: [
    { to: "/employee", end: true, icon: "fa-house",  label: "Dashboard" },
  ]},
  { section: "Support", items: [
    { to: "/tickets", icon: "fa-ticket", label: "Raise / Track Tickets" },
  ]},
];

function Sidebar({ role = "Admin" }) {
  const navigate  = useNavigate();
  const navConfig = role === "Employee" ? EMPLOYEE_NAV : ADMIN_NAV;

  // Derive user initials from localStorage
  let user = null;
  try { user = JSON.parse(localStorage.getItem("user")); } catch {}
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

  const handleLogout = () => {
    try { logout(); navigate("/"); } catch (err) { console.error(err); }
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-logo">Asset<span>Manage</span></div>
        <div className="brand-sub">IT Asset Management</div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navConfig.map(section => (
          <div key={section.section}>
            <div className="nav-section">{section.section}</div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `nav-item${isActive ? " active" : ""}`
                }
              >
                <i className={`fas ${item.icon}`}></i>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{user?.username || "User"}</div>
            <div className="user-role">{role}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout} type="button">
          <i className="fas fa-right-from-bracket"></i>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;