import { SectionTitle } from "../common";
import UserAvatar from "./UserAvatar";

function UserForm({
  form,
  errors,
  isEditing,
  loading,
  onCancelEdit,
  onChange,
  onPhotoChange,
  onSubmit,
}) {
  return (
    <div className="card user-form-card">
      <SectionTitle
        icon={`fas ${isEditing ? "fa-user-pen" : "fa-user-plus"} text-muted`}
        title={isEditing ? "Update Existing User" : "Create Admin / Employee"}
      >
        {isEditing && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onCancelEdit}
          >
            Cancel Edit
          </button>
        )}
      </SectionTitle>

      {errors.form && <div className="form-error-banner">{errors.form}</div>}

      {isEditing && (
        <div className="edit-user-summary">
          <UserAvatar user={form} size="small" />
          <div>
            <strong>{form.name || form.username}</strong>
            <p>
              {form.email || "No email available"} · {form.role}
              {form.employeeId ? ` · Employee ID: ${form.employeeId}` : ""}
            </p>
          </div>
        </div>
      )}

      <div className="form-grid-3">
        <div className="form-group">
          <label className="form-label">Role *</label>
          <select
            className={`form-control ${errors.role ? "is-invalid" : ""}`}
            name="role"
            value={form.role}
            onChange={onChange}
          >
            <option value="Employee">Employee</option>
            <option value="Admin">Admin</option>
          </select>
          {errors.role && <p className="field-error">{errors.role}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Username *</label>
          <input
            className={`form-control ${errors.username ? "is-invalid" : ""}`}
            type="text"
            name="username"
            value={form.username}
            placeholder="e.g. rana"
            onChange={onChange}
          />
          {errors.username && <p className="field-error">{errors.username}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Password {isEditing ? "" : "*"}</label>
          <input
            className={`form-control ${errors.password ? "is-invalid" : ""}`}
            type="password"
            name="password"
            value={form.password}
            placeholder={isEditing ? "Leave blank while updating" : "Enter password"}
            onChange={onChange}
            disabled={isEditing}
          />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>
      </div>

      <div className="form-grid-3">
        <div className="form-group">
          <label className="form-label">{form.role} Name *</label>
          <input
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            type="text"
            name="name"
            value={form.name}
            placeholder={form.role === "Admin" ? "e.g. Admin Rana" : "e.g. John Doe"}
            onChange={onChange}
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Email *</label>
          <input
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            type="email"
            name="email"
            value={form.email}
            placeholder="e.g. john@example.com"
            onChange={onChange}
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Profile Photo</label>
          <input
            className="form-control"
            type="file"
            accept="image/*"
            onChange={onPhotoChange}
          />
          {form.profilePhoto && (
            <img
              src={form.profilePhoto}
              alt="Profile preview"
              className="profile-preview"
            />
          )}
        </div>
      </div>

      <div className="form-actions-right">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onSubmit}
          disabled={loading}
        >
          <i
            className={`fas ${
              loading ? "fa-spinner fa-spin" : isEditing ? "fa-floppy-disk" : "fa-user-plus"
            }`}
          />
          {loading ? "Saving..." : isEditing ? "Update User" : "Create User"}
        </button>
      </div>
    </div>
  );
}

export default UserForm;
