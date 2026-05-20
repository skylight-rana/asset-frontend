import API from "./api";

export const createUser = (data) =>
  API.post("/account/users", data);
