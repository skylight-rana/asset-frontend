import API from "./api";

export const uploadDocument = (formData) =>
  API.post("/assetdocument/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });