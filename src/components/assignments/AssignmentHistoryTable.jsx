import Pagination from "../../components/Pagination";
import { formatDate, isReturned } from "../../utils";
import { DetailsModal, EmptyState, SectionTitle, StatusBadge, StatusFilter } from "../common";

function AssignmentHistoryTable({
  loading,
  assignments,
  paginatedAssignments,
  statusFilters,
  showStatusFilter,
  hasActiveAssignments,
  currentPage,
  pageSize,
  selectedDetail,
  onCloseDetail,
  onShowAsset,
  onShowEmployee,
  onPageChange,
  onPageSizeChange,
  onStatusFilterToggle,
  onStatusFilterChange,
  onReturn,
}) {
  const handleReturnClick = (e) => {
    e.stopPropagation();
    onReturn(e.currentTarget.dataset.assignmentId);
  };

  return (
    <div className="card" id="assignment-history">
      <SectionTitle icon="fas fa-clock-rotate-left" title="Assignment History" />

      {loading ? (
        <EmptyState icon="fas fa-spinner fa-spin" message="Loading..." />
      ) : assignments.length === 0 ? (
        <EmptyState icon="fas fa-inbox" message="No assignments found for selected filters." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Employee Name</th>
                <th>Issued</th>
                <th>Return Date</th>
                <StatusFilter filters={statusFilters} visible={showStatusFilter} onToggle={onStatusFilterToggle} onChange={onStatusFilterChange} />
                {hasActiveAssignments && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedAssignments.map((assignment) => {
                const assignmentId = assignment.assignmentId || assignment.id;
                const returned = isReturned(assignment);
                return (
                  <tr key={assignmentId}>
                    <td className="asset-name clickable-text" onClick={() => onShowAsset(assignment)}>{assignment.assetName || `Asset #${assignment.assetId}`}</td>
                    <td className="clickable-text" onClick={() => onShowEmployee(assignment)}>{assignment.employeeName || `Employee #${assignment.employeeId}`}</td>
                    <td className="td-mono">{formatDate(assignment.issuedDate)}</td>
                    <td className="td-mono">{formatDate(assignment.returnDate || assignment.actualReturnDate)}</td>
                    <td><StatusBadge status={returned ? "Returned" : "Active"} className={returned ? "badge-green" : "badge-warn"} /></td>
                    {hasActiveAssignments && (
                      <td>{!returned && <button type="button" className="btn btn-secondary btn-sm" data-assignment-id={assignmentId} onClick={handleReturnClick}><i className="fas fa-rotate-left" />Return</button>}</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination page={currentPage} pageSize={pageSize} totalItems={assignments.length} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
        </div>
      )}

      <DetailsModal title={selectedDetail?.title || "Details"} open={Boolean(selectedDetail)} onClose={onCloseDetail}>
        {selectedDetail && (
          <div className="detail-grid">
            {selectedDetail.items.map((item) => (
              <div className="detail-item" key={item.label}>
                <span className="detail-label">{item.label}</span>
                <span className="detail-value">{item.value || "—"}</span>
              </div>
            ))}
          </div>
        )}
      </DetailsModal>
    </div>
  );
}

export default AssignmentHistoryTable;
