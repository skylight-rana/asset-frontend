import { NavLink, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { logout } from "../../utils/auth";
import "./Sidebar.css";

const NAVIGATION_CONFIG = {
  Admin: [
    {
      section: "Overview",
      items: [
        {
          to: ROUTES.ADMIN_DASHBOARD,
          end: true,
          icon: "fa-house",
          label: "Dashboard",
        },
      ],
    },
    {
      section: "Asset Management",
      items: [
        {
          to: ROUTES.ADMIN_ASSETS,
          icon: "fa-box",
          label: "Assets",
        },
        {
          to: ROUTES.ADMIN_ASSIGNMENTS,
          icon: "fa-link",
          label: "Assignments",
        },
        {
          to: ROUTES.ADMIN_DOCUMENTS,
          icon: "fa-file",
          label: "Documents",
        },
      ],
    },
    {
      section: "Support",
      items: [
        {
          to: ROUTES.ADMIN_TICKETS,
          icon: "fa-ticket",
          label: "Tickets",
        },
      ],
    },
  ],

  Employee: [
    {
      section: "My Workspace",
      items: [
        {
          to: ROUTES.EMPLOYEE_DASHBOARD,
          end: true,
          icon: "fa-house",
          label: "Dashboard",
        },
      ],
    },
    {
      section: "Support",
      items: [
        {
          to: ROUTES.EMPLOYEE_TICKETS,
          icon: "fa-ticket",
          label: "Raise / Track Tickets",
        },
      ],
    },
  ],
};

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    console.error("Invalid user data in localStorage", error);
    localStorage.removeItem("user");
    return null;
  }
}

function getInitials(username) {
  if (!username) return "??";

  return username.slice(0, 2).toUpperCase();
}

function Sidebar({ role = "Admin" }) {
  const navigate = useNavigate();

  const user = getStoredUser();
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
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
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