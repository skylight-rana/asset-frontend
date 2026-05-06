import API from "./api";

export const getAssets = () => API.get("/asset");

export const createAsset = (data) => API.post("/asset", data);

export const updateAsset = (id, data) => API.put(`/asset/${id}`, data);

export const deleteAsset = (id) => API.delete(`/asset/${id}`);