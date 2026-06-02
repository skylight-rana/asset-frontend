import { useEffect, useMemo, useState } from "react";

import {
  ACCEPTED_DOCUMENT_TYPES,
  MAX_UPLOAD_FILE_SIZE_BYTES,
  MAX_UPLOAD_FILE_SIZE_MB,
} from "../../constants";
import { DashboardLayout } from "../../layouts";
import {
  getAssets,
  getDocumentsByAsset,
  getDocumentDownloadUrl,
  getDocumentViewUrl,
  uploadDocument,
} from "../../services";
import { getApiErrorMessage } from "../../utils";

import "./Upload.css";


function Upload() {
  const [assets, setAssets] = useState([]);
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(Date.now());
  const [assetId, setAssetId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [assetDocumentMap, setAssetDocumentMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadAssets();
  }, []);

  const selectedAsset = useMemo(() => {
    return assets.find((asset) => String(asset.id) === String(assetId));
  }, [assets, assetId]);

  const loadDocuments = async (selectedAssetId) => {
    if (!selectedAssetId) {
      setDocuments([]);
      return;
    }

    try {
      setLoadingDocuments(true);
      const res = await getDocumentsByAsset(selectedAssetId);
      setDocuments(res.data || []);
    } catch (error) {
      console.error("Failed to load documents", error);
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const loadAssets = async () => {
    try {
      setLoadingAssets(true);

      const res = await getAssets();
      const loadedAssets = res.data || [];
      setAssets(loadedAssets);

      const documentEntries = await Promise.all(
        loadedAssets.map(async (asset) => {
          try {
            const documentRes = await getDocumentsByAsset(asset.id);
            return [asset.id, (documentRes.data || []).length];
          } catch {
            return [asset.id, 0];
          }
        })
      );

      setAssetDocumentMap(Object.fromEntries(documentEntries));
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



  const handleAssetChange = (e) => {
    const selectedAssetId = e.target.value;

    setAssetId(selectedAssetId);
    setSuccessMessage("");
    setErrors((prev) => ({ ...prev, assetId: "", form: "" }));
    loadDocuments(selectedAssetId);
  };

  const handleDropZoneClick = () => {
    document.getElementById("file-input")?.click();
  };

  const handleFileInputChange = (e) => {
    handleFileChange(e.target.files[0]);
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
      setErrors({});
      setFileKey(Date.now());
      loadDocuments(assetId);
      setAssetDocumentMap((prev) => ({ ...prev, [assetId]: (prev[assetId] || 0) + 1 }));
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
            <span className="badge badge-blue">Step 1 Select Asset → Step 2 Upload File → Step 3 View Documents</span>
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
              onChange={handleAssetChange}
              disabled={loadingAssets}
            >
              <option value="">
                {loadingAssets ? "Loading assets..." : "Select asset..."}
              </option>

              {assets.map((asset) => {
                const hasDocument = assetDocumentMap[asset.id] > 0;
                return (
                  <option key={asset.id} value={asset.id} className={hasDocument ? "option-has-document" : ""}>
                    {hasDocument ? "★ " : ""}#{asset.id} - {asset.name} ({asset.serialNumber}){hasDocument ? " - Document uploaded" : ""}
                  </option>
                );
              })}
            </select>

            {errors.assetId && (
              <p className="field-error">{errors.assetId}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Document File *</label>

            <div
              className={`drop-zone ${errors.file ? "drop-zone-error" : ""}`}
              onClick={handleDropZoneClick}
            >
              <input
                id="file-input"
                key={fileKey}
                type="file"
                accept={ACCEPTED_DOCUMENT_TYPES}
                style={{ display: "none" }}
                onChange={handleFileInputChange}
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
            <li>After selecting an asset, uploaded documents appear below</li>
          </ul>
        </div>

        <div className="card document-list-card">
          <div className="section-title">
            <i className="fas fa-file-lines text-muted" />
            <span>Uploaded Documents</span>
          </div>

          {!assetId ? (
            <div className="empty-state compact">
              <i className="fas fa-folder-open" />
              <p>Select an asset to view uploaded documents.</p>
            </div>
          ) : loadingDocuments ? (
            <div className="empty-state compact">
              <i className="fas fa-spinner fa-spin" />
              <p>Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="empty-state compact">
              <i className="fas fa-inbox" />
              <p>No documents uploaded for this asset.</p>
            </div>
          ) : (
            <div className="document-list">
              {documents.map((document) => (
                <div className="document-row" key={document.id}>
                  <div className="document-info">
                    <i className="fas fa-file" />
                    <span>{document.fileName}</span>
                  </div>

                  <div className="document-actions">
                    <a
                      className="btn btn-secondary btn-sm"
                      href={getDocumentViewUrl(document.id)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <i className="fas fa-eye" />
                      View
                    </a>

                    <a
                      className="btn btn-primary btn-sm"
                      href={getDocumentDownloadUrl(document.id)}
                    >
                      <i className="fas fa-download" />
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Upload;
