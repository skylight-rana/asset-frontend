import { useState } from "react";

import { DashboardLayout } from "../../layouts";
import { createUser } from "../../services";
import { getApiErrorMessage } from "../../utils";

import "./Users.css";

const INITIAL_FORM = {
  name: "",
  email: "",
  username: "",
  password: "",
  role: "Employee",
};

function Users() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!form.role) nextErrors.role = "Please select user role.";
    if (!form.username.trim()) nextErrors.username = "Username is required.";
    if (!form.password.trim()) nextErrors.password = "Password is required.";

    if (form.role === "Employee") {
      if (!form.name.trim()) nextErrors.name = "Employee name is required.";
      if (!form.email.trim()) nextErrors.email = "Employee email is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
    setSuccess("");
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      username: form.username.trim(),
      password: form.password.trim(),
      role: form.role,
    };

    try {
      setLoading(true);
      setErrors({});
      setSuccess("");

      await createUser(payload);

      setForm(INITIAL_FORM);
      setSuccess(`${payload.role} user created successfully.`);
    } catch (error) {
      console.error("Failed to create user", error);
      setErrors({ form: getApiErrorMessage(error, "Failed to create user.") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="Admin" title="Users">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">User Management</p>
          <h1>Create Users</h1>
        </div>
      </div>

      <div className="card user-form-card">
        <div className="section-title">
          <i className="fas fa-user-plus text-muted" />
          <span>Create Admin / Employee</span>
        </div>

        {errors.form && <div className="form-error-banner">{errors.form}</div>}
        {success && <div className="form-success-banner">{success}</div>}

        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">Role *</label>
            <select
              className={`form-control ${errors.role ? "is-invalid" : ""}`}
              name="role"
              value={form.role}
              onChange={handleChange}
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
              onChange={handleChange}
            />
            {errors.username && <p className="field-error">{errors.username}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              type="password"
              name="password"
              value={form.password}
              placeholder="Enter password"
              onChange={handleChange}
            />
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>
        </div>

        {form.role === "Employee" && (
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Employee Name *</label>
              <input
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                type="text"
                name="name"
                value={form.name}
                placeholder="e.g. John Doe"
                onChange={handleChange}
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
                onChange={handleChange}
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>
          </div>
        )}

        <div className="form-actions-right">
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            <i className={`fas ${loading ? "fa-spinner fa-spin" : "fa-user-plus"}`} />
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Users;
