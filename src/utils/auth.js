export const logout = () => {
  localStorage.removeItem("user");
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const isAuthenticated = () => {
  return !!getUser();
};

export const getUserRole = () => {
  return getUser()?.role || null;
};