import API from "./api";

export const createUser = (data) =>
  API.post("/account/users", data);

export const getUsers = () =>
  API.get("/account/users");

export const updateUser = (id, data) =>
  API.put(`/account/users/${id}`, data);
