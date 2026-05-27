import API from "./api";

export const uploadDocument = (formData) =>
  API.post("/assetdocument/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getDocumentsByAsset = (assetId) =>
  API.get(`/assetdocument/${assetId}`);

export const getDocumentViewUrl = (documentId) =>
  `${API.defaults.baseURL}/assetdocument/view/${documentId}`;

export const getDocumentDownloadUrl = (documentId) =>
  `${API.defaults.baseURL}/assetdocument/download/${documentId}`;
