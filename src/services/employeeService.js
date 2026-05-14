import API from "./api";

// GET ALL EMPLOYEES
export const getEmployees = () =>
  API.get("/employee");