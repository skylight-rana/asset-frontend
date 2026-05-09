import { useState } from "react";
import { uploadDocument } from "../../services/documentService";
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

      // FILE
      formData.append("file", file);

      // ASSET ID AS NUMBER
      formData.append(
        "assetId",
        Number(assetId)
      );

      console.log(
        "Uploading Asset ID:",
        Number(assetId)
      );

      await uploadDocument(formData);

      alert("File uploaded successfully");

      // RESET FORM
      setFile(null);
      setAssetId("");
      setFileKey(Date.now());

    } catch (err) {

      console.error("Upload Error:", err);

      if (err.response) {
        console.log(err.response.data);
      }

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