import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { NAVIGATION_CONFIG, ROUTES } from "../../constants";
import { getUser, logout } from "../../utils";
import { DetailsModal } from "../common";

import "./Sidebar.css";

function getInitials(user) {
  const source = user?.name || user?.username || "User";
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function Sidebar({ role = "Admin" }) {
  const navigate = useNavigate();
  const user = getUser();
  const [showProfile, setShowProfile] = useState(false);
  const navItems = NAVIGATION_CONFIG[role] || NAVIGATION_CONFIG.Admin;
  const initials = getInitials(user);

  const displayName = user?.name || user?.username || "User";
  const displayRole = user?.role || role;

  const profileItems = [
    { label: "Name", value: user?.name || "Not added", icon: "fa-id-card" },
    { label: "Username", value: user?.username || "Not added", icon: "fa-user" },
    { label: "Email", value: user?.email || "Not added", icon: "fa-envelope" },
    { label: "Role", value: displayRole, icon: "fa-shield-halved" },
  ];

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
        <button
          type="button"
          className="sidebar-user profile-chip"
          onClick={() => setShowProfile(true)}
        >
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt="Profile" className="profile-photo" />
          ) : (
            <div className="user-avatar">{initials}</div>
          )}
          <div className="user-info">
            <div className="user-name">{displayName}</div>
            <div className="user-role">{displayRole}</div>
          </div>
        </button>

        <button type="button" className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-right-from-bracket" />
          <span>Logout</span>
        </button>
      </div>

      <DetailsModal
        title="User Profile"
        icon="fas fa-user"
        open={showProfile}
        onClose={() => setShowProfile(false)}
      >
        <div className="profile-dialog">
          <div className="profile-dialog-hero">
            <div className="profile-dialog-avatar-wrap">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={displayName}
                  className="profile-dialog-avatar"
                />
              ) : (
                <div className="profile-dialog-avatar fallback">{initials}</div>
              )}
            </div>

            <div className="profile-dialog-main">
              <span className="profile-role-pill">{displayRole}</span>
              <h2>{displayName}</h2>
              <p>{user?.email || "Email is not added yet"}</p>
            </div>
          </div>

          <div className="profile-dialog-details">
            {profileItems.map((item) => (
              <div className="profile-detail-card" key={item.label}>
                <div className="profile-detail-icon">
                  <i className={`fas ${item.icon}`} />
                </div>
                <div>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="profile-dialog-note">
            <i className="fas fa-circle-info" />
            <span>
              Profile details are managed from the Users screen by an admin.
            </span>
          </div>
        </div>
      </DetailsModal>
    </aside>
  );
}

export default Sidebar;
