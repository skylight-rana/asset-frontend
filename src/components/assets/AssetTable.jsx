import { EmptyState, SectionTitle, StatusBadge, StatusFilter } from "../common";

function AssetTable({
  assets,
  search,
  statusFilters,
  showStatusFilter,
  onStatusFilterToggle,
  onStatusFilterChange,
  onDelete,
  getAssetAssignment,
  getAssetStatus,
  getEmployeeName,
}) {
  const handleDeleteClick = (e) => {
    onDelete(e.currentTarget.dataset.assetId);
  };

  if (assets.length === 0) {
    return (
      <div className="card asset-list-card">
        <SectionTitle icon="fas fa-box" title="All Assets" />
        <EmptyState
          icon="fas fa-box-open"
          message={
            search
              ? "No assets match your search."
              : "No assets found for selected filters."
          }
        />
      </div>
    );
  }

  return (
    <div className="card asset-list-card">
      <SectionTitle icon="fas fa-box" title="All Assets" />

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Serial Number</th>
              <StatusFilter
                filters={statusFilters}
                visible={showStatusFilter}
                onToggle={onStatusFilterToggle}
                onChange={onStatusFilterChange}
              />
              <th>Assigned To</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {assets.map((asset) => {
              const assignment = getAssetAssignment(asset.id);
              const status = getAssetStatus(assignment);
              const isAssigned = status === "Assigned";

              return (
                <tr key={asset.id}>
                  <td className="td-mono">{asset.id}</td>
                  <td className="asset-name">{asset.name}</td>
                  <td>
                    <StatusBadge status={asset.type} className="badge-blue" />
                  </td>
                  <td className="td-mono">{asset.serialNumber}</td>
                  <td>
                    <StatusBadge
                      status={status}
                      className={isAssigned ? "badge-warn" : "badge-green"}
                    />
                  </td>
                  <td>
                    {isAssigned ? (
                      <span className="employee-name">
                        {getEmployeeName(assignment.employeeId)}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      data-asset-id={asset.id}
                      onClick={handleDeleteClick}
                    >
                      <i className="fas fa-trash-can" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssetTable;
