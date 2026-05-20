import { useEffect, useMemo, useState } from "react";

import {
  ACCEPTED_DOCUMENT_TYPES,
  MAX_UPLOAD_FILE_SIZE_BYTES,
  MAX_UPLOAD_FILE_SIZE_MB,
} from "../../constants";
import { DashboardLayout } from "../../layouts";
import { getAssets, uploadDocument } from "../../services";
import { getApiErrorMessage } from "../../utils";

import "./Upload.css";


function Upload() {
  const [assets, setAssets] = useState([]);
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(Date.now());
  const [assetId, setAssetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadAssets();
  }, []);

  const selectedAsset = useMemo(() => {
    return assets.find((asset) => String(asset.id) === String(assetId));
  }, [assets, assetId]);

  const loadAssets = async () => {
    try {
      setLoadingAssets(true);

      const res = await getAssets();
      setAssets(res.data || []);
    } catch (error) {
      console.error("Failed to load assets", error);
      setErrors((prev) => ({
        ...prev,
        assetId: "Unable to load assets. Please refresh the page.",
      }));
    } finally {
      setLoadingAssets(false);
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!assetId) {
      nextErrors.assetId = "Please select an asset.";
    } else if (!selectedAsset) {
      nextErrors.assetId = "Selected asset was not found. Please choose again.";
    }

    if (!file) {
      nextErrors.file = "Please select a file.";
    } else if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
      nextErrors.file = `File size should not be more than ${MAX_UPLOAD_FILE_SIZE_MB}MB.`;
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleFileChange = (selectedFile) => {
    setSuccessMessage("");
    setFile(selectedFile || null);

    if (selectedFile) {
      setErrors((prev) => ({
        ...prev,
        file:
          selectedFile.size > MAX_UPLOAD_FILE_SIZE_BYTES
            ? `File size should not be more than ${MAX_UPLOAD_FILE_SIZE_MB}MB.`
            : "",
      }));
    }
  };

  const handleUpload = async () => {
    setSuccessMessage("");

    if (!validateForm()) return;

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("File", file);
      formData.append("AssetId", String(assetId));

      await uploadDocument(formData);

      setSuccessMessage("File uploaded successfully.");

      setFile(null);
      setAssetId("");
      setErrors({});
      setFileKey(Date.now());
    } catch (err) {
      const message =
        getApiErrorMessage(err, "Upload failed. Please try again.");

      setErrors((prev) => ({
        ...prev,
        form: message,
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="Admin" title="Documents">
      <div className="page-header">
        <h1>Document Upload</h1>
      </div>

      <div className="upload-page-shell">
        <div className="card upload-card">
          <div className="section-title">
            <i className="fas fa-upload text-muted" />
            <span>Upload Asset Document</span>
          </div>

          {successMessage && (
            <div className="form-success">{successMessage}</div>
          )}

          {errors.form && <div className="form-error">{errors.form}</div>}

          <div className="form-group">
            <label className="form-label">Asset *</label>

            <select
              className={`form-control ${errors.assetId ? "input-error" : ""}`}
              value={assetId}
              onChange={(e) => {
                setAssetId(e.target.value);
                setSuccessMessage("");
                setErrors((prev) => ({ ...prev, assetId: "", form: "" }));
              }}
              disabled={loadingAssets}
            >
              <option value="">
                {loadingAssets ? "Loading assets..." : "Select asset..."}
              </option>

              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  #{asset.id} - {asset.name} ({asset.serialNumber})
                </option>
              ))}
            </select>

            {errors.assetId && (
              <p className="field-error">{errors.assetId}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Document File *</label>

            <div
              className={`drop-zone ${errors.file ? "drop-zone-error" : ""}`}
              onClick={() => document.getElementById("file-input").click()}
            >
              <input
                id="file-input"
                key={fileKey}
                type="file"
                accept={ACCEPTED_DOCUMENT_TYPES}
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e.target.files[0])}
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

            {errors.file && <p className="field-error">{errors.file}</p>}
          </div>

          <div className="upload-actions">
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={loading || loadingAssets}
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
            <li>Select an existing asset from the dropdown before uploading</li>
            <li>Accepted formats: PDF, PNG, JPG max 10MB</li>
            <li>Click Upload to save the document to the asset record</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Upload;
