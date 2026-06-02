function UserAvatar({ user = {}, size = "normal" }) {
  if (user.profilePhoto) {
    return (
      <img
        src={user.profilePhoto}
        alt={user.name || user.username || "User"}
        className={size === "small" ? "profile-preview small" : "table-avatar"}
      />
    );
  }

  return (
    <span className="table-avatar placeholder">
      <i className="fas fa-user" />
    </span>
  );
}

export default UserAvatar;
