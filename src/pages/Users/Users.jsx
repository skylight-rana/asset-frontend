import { useEffect, useMemo, useState } from "react";

import {
  NotificationDialog,
  PageHeader,
  UserForm,
  UserTable,
} from "../../components";
import { useNotification } from "../../hooks";
import { DashboardLayout } from "../../layouts";
import { createUser, getEmployees, getUsers, updateUser } from "../../services";
import {
  buildUserPayload,
  getApiErrorMessage,
  INITIAL_USER_FORM,
  normalizeUser,
  userMatchesSearch,
  validateUserForm,
} from "../../utils";

import "./Users.css";

function Users() {
  const { notification, showSuccess, showError, closeNotification } =
    useNotification();

  const [form, setForm] = useState(INITIAL_USER_FORM);
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(form.id);

  const filteredUsers = useMemo(
    () => users.filter((user) => userMatchesSearch(user, search)),
    [users, search]
  );

  const loadUsers = async () => {
    try {
      const [userResponse, employeeResponse] = await Promise.allSettled([
        getUsers(),
        getEmployees(),
      ]);

      const loadedEmployees =
        employeeResponse.status === "fulfilled" ? employeeResponse.value.data || [] : [];
      const loadedUsers =
        userResponse.status === "fulfilled" ? userResponse.value.data || [] : [];

      setEmployees(loadedEmployees);
      setUsers(loadedUsers.map((user) => normalizeUser(user, loadedEmployees)));
    } catch {
      setUsers([]);
      setEmployees([]);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prevForm) => ({ ...prevForm, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () =>
      setForm((prevForm) => ({ ...prevForm, profilePhoto: reader.result }));
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setForm(INITIAL_USER_FORM);
    setErrors({});
  };

  const handleEdit = (user) => {
    const selectedUser = normalizeUser(user, employees);

    setForm({
      id: selectedUser.id,
      employeeId: selectedUser.employeeId || "",
      name: selectedUser.name || "",
      email: selectedUser.email || "",
      username: selectedUser.username || "",
      password: "",
      role: selectedUser.role || "Employee",
      profilePhoto: selectedUser.profilePhoto || "",
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    const nextErrors = validateUserForm(form, isEditing);

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = buildUserPayload(form, isEditing);

    try {
      setLoading(true);

      if (isEditing) await updateUser(form.id, payload);
      else await createUser(payload);

      showSuccess(
        isEditing ? "User updated" : "User created",
        `${payload.role} details saved successfully.`
      );
      resetForm();
      loadUsers();
    } catch (error) {
      showError(
        "User save failed",
        getApiErrorMessage(error, "Failed to save user.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="Admin" title="Users">
      <PageHeader title={isEditing ? "Update User" : "User Management"} />

      <UserForm
        form={form}
        errors={errors}
        isEditing={isEditing}
        loading={loading}
        onCancelEdit={resetForm}
        onChange={handleChange}
        onPhotoChange={handlePhotoChange}
        onSubmit={handleSubmit}
      />

      <UserTable
        users={filteredUsers}
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        onEdit={handleEdit}
      />

      <NotificationDialog
        open={Boolean(notification)}
        type={notification?.type}
        title={notification?.title}
        message={notification?.message}
        onClose={closeNotification}
      />
    </DashboardLayout>
  );
}

export default Users;
