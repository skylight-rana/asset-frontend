import API from "./api";

// UPLOAD DOCUMENT
export const uploadDocument = async (formData) => {

  return await API.post(
    "/assetdocument/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

};