export const INITIAL_USER_FORM = {
  id: null,
  employeeId: "",
  name: "",
  email: "",
  username: "",
  password: "",
  role: "Employee",
  profilePhoto: "",
};

export const normalizeUser = (user = {}, employees = []) => {
  const matchedEmployee = findMatchingEmployee(user, employees);

  return {
    ...user,
    id: user.id || user.userId,
    employeeId: user.employeeId || matchedEmployee?.id || "",
    username: user.username || user.userName || user.loginName || "",
    name:
      user.name ||
      user.fullName ||
      matchedEmployee?.name ||
      matchedEmployee?.employeeName ||
      "",
    email: user.email || matchedEmployee?.email || "",
    role: user.role || user.userRole || "Employee",
    profilePhoto: user.profilePhoto || user.profilePicture || user.photo || "",
  };
};

export const findMatchingEmployee = (user, employees = []) =>
  employees.find(
    (employee) =>
      sameValue(employee.userId || employee.userID || employee.user?.id, user.id) ||
      sameValue(employee.username || employee.userName, user.username || user.userName) ||
      sameValue(employee.email, user.email)
  );

const sameValue = (left, right) =>
  String(left || "").toLowerCase() === String(right || "").toLowerCase();

export const validateUserForm = (form, isEditing) => {
  const errors = {};

  if (!form.role) errors.role = "Please select user role.";
  if (!form.username.trim()) errors.username = "Username is required.";
  if (!isEditing && !form.password.trim()) {
    errors.password = "Password is required.";
  }
  if (!form.name.trim()) errors.name = `${form.role} name is required.`;
  if (!form.email.trim()) errors.email = `${form.role} email is required.`;

  return errors;
};

export const buildUserPayload = (form, isEditing) => {
  const payload = {
    name: form.name.trim(),
    email: form.email.trim(),
    username: form.username.trim(),
    role: form.role,
    profilePhoto: form.profilePhoto,
  };

  if (!isEditing) payload.password = form.password.trim();

  return payload;
};

export const userMatchesSearch = (user, search = "") => {
  const searchValue = search.trim().toLowerCase();
  if (!searchValue) return true;

  return [user.name, user.email, user.username, user.role].some((item) =>
    String(item || "").toLowerCase().includes(searchValue)
  );
};
