import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth";
import { ROUTES } from "../../constants/routes";
import "./Sidebar.css";

/* ================= ADMIN NAV ================= */

const ADMIN_NAV = [
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
];

/* ================= EMPLOYEE NAV ================= */

const EMPLOYEE_NAV = [
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
];

function Sidebar({ role = "Admin" }) {
  const navigate = useNavigate();

  const navConfig =
    role === "Employee"
      ? EMPLOYEE_NAV
      : ADMIN_NAV;

  /* ================= USER ================= */

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    localStorage.removeItem("user");
  }

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    try {
      logout();
      navigate(ROUTES.LOGIN);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= UI ================= */

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          Asset<span>Manage</span>
        </div>

        <div className="brand-sub">
          IT Asset Management
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navConfig.map((section) => (
          <div key={section.section}>
            <div className="nav-section">
              {section.section}
            </div>

            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `nav-item${isActive ? " active" : ""}`
                }
              >
                <i className={`fas ${item.icon}`} />

                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">
            {initials}
          </div>

          <div>
            <div className="user-name">
              {user?.username || "User"}
            </div>

            <div className="user-role">
              {role}
            </div>
          </div>
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
          type="button"
        >
          <i className="fas fa-right-from-bracket" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;