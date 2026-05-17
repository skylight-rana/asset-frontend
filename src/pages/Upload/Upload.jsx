import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { uploadDocument } from "../../services/documentService";
import "./Upload.css";

function Upload() {
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(Date.now());
  const [assetId, setAssetId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file || !assetId.trim()) {
      alert("Please select a file and enter Asset ID");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("assetId", assetId);

      await uploadDocument(formData);

      alert("File uploaded successfully");

      setFile(null);
      setAssetId("");
      setFileKey(Date.now());
    } catch (err) {
      alert(err.response?.data || err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="Admin" title="Documents">
      <div className="page-header">
        <h1>Document Upload</h1>
      </div>

      <div style={{ maxWidth: 600 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">
            <i className="fas fa-upload text-muted" />
            <span>Upload Asset Document</span>
          </div>

          <div className="form-group">
            <label className="form-label">Asset ID *</label>
            <input
              className="form-control"
              type="number"
              placeholder="Enter Asset ID"
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Document File *</label>

            <div
              className="drop-zone"
              onClick={() => document.getElementById("file-input").click()}
            >
              <input
                id="file-input"
                key={fileKey}
                type="file"
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files[0])}
              />

              <i className="fas fa-cloud-arrow-up drop-icon" />

              {file ? (
                <div>
                  <p className="drop-label">{file.name}</p>
                  <p className="drop-sub">
                    {(file.size / 1024).toFixed(1)} KB — click to change
                  </p>
                </div>
              ) : (
                <div>
                  <p className="drop-label">Click to upload or drag & drop</p>
                  <p className="drop-sub">PDF, PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin" /> Uploading…
                </>
              ) : (
                <>
                  <i className="fas fa-upload" /> Upload File
                </>
              )}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="section-title">
            <i className="fas fa-circle-info text-muted" />
            <span>Instructions</span>
          </div>

          <ul className="instruction-list">
            <li>Enter a valid Asset ID before uploading</li>
            <li>Accepted formats: PDF, PNG, JPG max 10MB</li>
            <li>Click Upload to save the document to the asset record</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Upload;