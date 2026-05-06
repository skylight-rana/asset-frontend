import { useState } from "react";
import { uploadDocument } from "../../services/documentService";
import Navbar from "../../components/Navbar/Navbar";

import "./Upload.css";

function Upload() {

  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(Date.now());
  const [assetId, setAssetId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {

    if (!file || !assetId.trim()) {
      alert("Please select file and enter Asset ID");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("assetId", assetId);

      await uploadDocument(formData);

      alert("File uploaded successfully");

      // Reset
      setFile(null);
      setAssetId("");
      setFileKey(Date.now());

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">

      {/* HEADER */}
      <div className="header">
        <h2>Document Upload</h2>
      </div>

      {/* NAVBAR */}
      <Navbar />

      {/* UPLOAD FORM */}
      <div className="card">

        <h3>Upload Asset Document</h3>

        <div className="form-group">

          <input
            key={fileKey}
            type="file"
            onChange={e => setFile(e.target.files[0])}
          />

          <input
            placeholder="Enter Asset ID"
            value={assetId}
            onChange={e => setAssetId(e.target.value)}
          />

        </div>

        {/* File Preview */}
        {file && (
          <p className="file-name">
            Selected: <b>{file.name}</b>
          </p>
        )}

        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload File"}
        </button>

      </div>

      {/* INFO CARD */}
      <div className="card">
        <h3>Instructions</h3>
        <ul>
          <li>Enter valid Asset ID</li>
          <li>Select a document file (PDF, Image, etc.)</li>
          <li>Click upload to save the document</li>
        </ul>
      </div>

    </div>
  );
}

export default Upload;