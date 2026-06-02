import { SearchBox } from "../common";
import UserAvatar from "./UserAvatar";

function UserTable({ users, search, onSearchChange, onEdit }) {
  return (
    <div className="card">
      <div className="section-title">
        <i className="fas fa-users text-muted" />
        <span>Existing Users</span>
        <SearchBox
          value={search}
          onChange={onSearchChange}
          placeholder="Search users..."
        />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Email</th>
              <th>Username</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state compact">
                    <i className="fas fa-users" />
                    <p>No users found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td><UserAvatar user={user} /></td>
                  <td>{user.name || "—"}</td>
                  <td>{user.email || "—"}</td>
                  <td>{user.username}</td>
                  <td><span className="badge badge-blue">{user.role}</span></td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onEdit(user)}
                    >
                      <i className="fas fa-user-pen" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserTable;
