import { useState } from "react";
// import { uploadDocument } from "../../services/documentService";
import Navbar from "../../components/Navbar/Navbar";

import "./Upload.css";

function Upload() {

  const [file, setFile] = useState(null);

  const [fileKey, setFileKey] = useState(Date.now());

  const [assetId, setAssetId] = useState("");

  const [loading, setLoading] = useState(false);

  // UPLOAD FILE
  const handleUpload = async () => {

    if (!file || !assetId.trim()) {

      alert("Please select file and enter Asset ID");
      return;

    }

    try {

      setLoading(true);

      const formData = new FormData();

      // EXACT FIELD NAMES
      formData.append("file", file);

      formData.append(
        "assetId",
        assetId
      );

      console.log("Asset ID:", assetId);

      const response = await fetch(
        "https://localhost:7117/api/assetdocument/upload",
        {
          method: "POST",
          body: formData
        }
      );

      const result = await response.text();

      console.log(result);

      if (!response.ok) {
        throw new Error(result);
      }

      alert("File uploaded successfully");

      // RESET
      setFile(null);
      setAssetId("");
      setFileKey(Date.now());

    } catch (err) {

      console.error(err);

      alert(err.message || "Upload failed");

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

          {/* FILE INPUT */}
          <input
            key={fileKey}
            type="file"
            onChange={e =>
              setFile(e.target.files[0])
            }
          />

          {/* ASSET ID */}
          <input
            type="number"
            placeholder="Enter Asset ID"
            value={assetId}
            onChange={e =>
              setAssetId(e.target.value)
            }
          />

        </div>

        {/* FILE PREVIEW */}
        {file && (
          <p className="file-name">
            Selected: <b>{file.name}</b>
          </p>
        )}

        {/* BUTTON */}
        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading
            ? "Uploading..."
            : "Upload File"}
        </button>

      </div>

      {/* INFO CARD */}
      <div className="card">

        <h3>Instructions</h3>

        <ul>
          <li>Enter valid Asset ID</li>
          <li>Select a document file</li>
          <li>Click upload to save document</li>
        </ul>

      </div>

    </div>
  );
}

export default Upload;