import API from "./api";

export const assignAsset = (data) =>
  API.post("/assetassignment/assign", data);

export const returnAsset = (data) =>
  API.post("/assetassignment/return", data);

export const getAssignments = () =>
  API.get("/assetassignment");