import Pagination from "../Pagination";
import { DetailsModal, EmptyState, SectionTitle, StatusBadge, StatusFilter } from "../common";
import { getDocumentDownloadUrl, getDocumentViewUrl } from "../../services";

function AssetDetails({ asset, assignment, employeeName, documents = [] }) {
  if (!asset) return null;

  return (
    <div className="detail-grid">
      <div className="detail-item"><span className="detail-label">Asset ID</span><span className="detail-value">#{asset.id}</span></div>
      <div className="detail-item"><span className="detail-label">Name</span><span className="detail-value">{asset.name}</span></div>
      <div className="detail-item"><span className="detail-label">Type</span><span className="detail-value">{asset.type}</span></div>
      <div className="detail-item"><span className="detail-label">Serial Number</span><span className="detail-value">{asset.serialNumber}</span></div>
      <div className="detail-item"><span className="detail-label">Status</span><span className="detail-value">{assignment ? "Assigned" : "Available"}</span></div>
      <div className="detail-item"><span className="detail-label">Current Employee</span><span className="detail-value">{assignment ? employeeName : "Not assigned"}</span></div>
      {assignment && <div className="detail-item"><span className="detail-label">Issued Date</span><span className="detail-value">{assignment.issuedDate ? new Date(assignment.issuedDate).toLocaleDateString() : "—"}</span></div>}
      {assignment && <div className="detail-item"><span className="detail-label">Condition At Issue</span><span className="detail-value">{assignment.conditionAtIssue || "—"}</span></div>}
      <div className="detail-item detail-item-wide">
        <span className="detail-label">Uploaded Documents</span>
        {documents.length === 0 ? (
          <span className="detail-value">No documents uploaded</span>
        ) : (
          <div className="document-mini-list">
            {documents.map((document, index) => {
              const documentId = document.id || document.documentId || document.assetDocumentId;
              return (
                <div className="document-mini-row" key={documentId || `${document.fileName}-${index}`}>
                  <span className="detail-value"><i className="fas fa-file" /> {document.fileName || document.name || `Document ${index + 1}`}</span>
                  {documentId && (
                    <span className="document-mini-actions">
                      <a className="btn btn-secondary btn-sm" href={getDocumentViewUrl(documentId)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}><i className="fas fa-eye" />View</a>
                      <a className="btn btn-primary btn-sm" href={getDocumentDownloadUrl(documentId)} onClick={(e) => e.stopPropagation()}><i className="fas fa-download" />Download</a>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AssetTable({
  assets,
  paginatedAssets,
  totalAssets,
  currentPage,
  pageSize,
  search,
  statusFilters,
  showStatusFilter,
  selectedAsset,
  selectedAssignment,
  selectedEmployeeName,
  documentsByAsset = {},
  uploadingAssetId,
  onUploadDocument,
  onAssetSelect,
  onCloseAssetDetails,
  onPageChange,
  onPageSizeChange,
  onStatusFilterToggle,
  onStatusFilterChange,
  onDelete,
  onQuickAssign,
  onQuickReturn,
  getAssetAssignment,
  getAssetStatus,
  getEmployeeName,
}) {
  const rows = paginatedAssets || assets;

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(e.currentTarget.dataset.assetId);
  };

  const handleAssignClick = (e) => {
    e.stopPropagation();
    const asset = assets.find((item) => String(item.id) === String(e.currentTarget.dataset.assetId));
    if (asset) onQuickAssign(asset);
  };

  const handleReturnClick = (e) => {
    e.stopPropagation();
    onQuickReturn(e.currentTarget.dataset.assignmentId);
  };

  const handleUploadClick = (e) => {
    e.stopPropagation();
  };

  const handleDocumentViewClick = (e) => {
    e.stopPropagation();
    const assetId = e.currentTarget.dataset.assetId;
    const asset = assets.find((item) => String(item.id) === String(assetId));
    if (asset) onAssetSelect(asset);
  };

  const handleFileChange = (e) => {
    const assetId = Number(e.currentTarget.dataset.assetId);
    const file = e.currentTarget.files?.[0];
    if (file && onUploadDocument) onUploadDocument(assetId, file);
    e.currentTarget.value = "";
  };

  const handleRowClick = (asset) => {
    onAssetSelect(asset);
  };

  if (assets.length === 0) {
    return (
      <div className="card asset-list-card" id="all-assets">
        <SectionTitle icon="fas fa-box" title="All Assets" />
        <EmptyState icon="fas fa-box-open" message={search ? "No assets match your search." : "No assets found for selected filters."} />
      </div>
    );
  }

  return (
    <div className="card asset-list-card" id="all-assets">
      <div className="asset-table-header">
        <SectionTitle icon="fas fa-box" title="All Assets" />
        <span className="table-count-pill">{totalAssets} records</span>
      </div>

      <div className="table-wrap asset-table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Serial Number</th>
              <StatusFilter filters={statusFilters} visible={showStatusFilter} onToggle={onStatusFilterToggle} onChange={onStatusFilterChange} />
              <th>Assigned To</th>
              <th>Documents</th>
              <th>Upload</th>
              <th>Quick Action</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((asset) => {
              const assignment = getAssetAssignment(asset.id);
              const status = getAssetStatus(assignment);
              const isAssigned = status === "Assigned";
              const assignmentId = assignment?.assignmentId || assignment?.id;
              const documents = documentsByAsset[asset.id] || [];
              const isUploading = uploadingAssetId === asset.id;
              return (
                <tr key={asset.id} className="clickable-row" onClick={() => handleRowClick(asset)}>
                  <td className="td-mono">{asset.id}</td>
                  <td className="asset-name clickable-text">{asset.name}</td>
                  <td><StatusBadge status={asset.type} className="badge-blue" /></td>
                  <td className="td-mono">{asset.serialNumber}</td>
                  <td><StatusBadge status={status} className={isAssigned ? "badge-warn" : "badge-green"} /></td>
                  <td>{isAssigned ? <span className="employee-name">{getEmployeeName(assignment.employeeId)}</span> : <span className="text-muted">—</span>}</td>
                  <td>
                    {documents.length > 0 ? (
                      <div className="asset-document-cell">
                        <span className="badge badge-blue"><i className="fas fa-file" /> {documents.length} file{documents.length > 1 ? "s" : ""}</span>
                        <button type="button" className="btn btn-secondary btn-sm" data-asset-id={asset.id} onClick={handleDocumentViewClick}><i className="fas fa-eye" />View</button>
                      </div>
                    ) : <span className="text-muted">No document</span>}
                  </td>
                  <td onClick={handleUploadClick}>
                    <label className={`btn btn-secondary btn-sm upload-inline-btn ${isUploading ? "disabled" : ""}`}>
                      <i className={`fas ${isUploading ? "fa-spinner fa-spin" : "fa-upload"}`} />
                      {isUploading ? "Uploading" : "Upload"}
                      <input type="file" hidden data-asset-id={asset.id} disabled={isUploading} onChange={handleFileChange} />
                    </label>
                  </td>
                  <td>
                    {isAssigned ? (
                      <button type="button" className="btn btn-secondary btn-sm" data-assignment-id={assignmentId} onClick={handleReturnClick}><i className="fas fa-rotate-left" />Return</button>
                    ) : (
                      <button type="button" className="btn btn-primary btn-sm" data-asset-id={asset.id} onClick={handleAssignClick}><i className="fas fa-link" />Assign</button>
                    )}
                  </td>
                  <td>
                    <button type="button" className="btn btn-danger btn-sm" data-asset-id={asset.id} onClick={handleDeleteClick} disabled={isAssigned} title={isAssigned ? "Return this asset before deleting it" : "Delete asset"}><i className="fas fa-trash-can" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination page={currentPage} pageSize={pageSize} totalItems={totalAssets} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />

      <DetailsModal title="Asset Details & History" icon="fas fa-box" open={Boolean(selectedAsset)} onClose={onCloseAssetDetails}>
        <AssetDetails asset={selectedAsset} assignment={selectedAssignment} employeeName={selectedEmployeeName} documents={selectedAsset ? documentsByAsset[selectedAsset.id] || [] : []} />
      </DetailsModal>
    </div>
  );
}

export default AssetTable;
