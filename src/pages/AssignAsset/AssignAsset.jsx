import { useEffect, useMemo, useState } from "react";

import { Pagination } from "../../components";
import { DEFAULT_PAGE_SIZE, INITIAL_ASSIGNMENT_FORM } from "../../constants";
import { DashboardLayout } from "../../layouts";
import { assignAsset, getAssignments, returnAsset } from "../../services";
import { formatDate, getApiErrorMessage, isReturned } from "../../utils";

import "./AssignAsset.css";

const INITIAL_STATUS_FILTERS = {
  Active: true,
  Returned: true,
};

function AssignAsset() {
  const [assignments, setAssignments] = useState([]);
  const [assignData, setAssignData] = useState(INITIAL_ASSIGNMENT_FORM);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [errors, setErrors] = useState({});

  const [statusFilters, setStatusFilters] = useState(
    INITIAL_STATUS_FILTERS
  );

  const [showStatusFilter, setShowStatusFilter] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  const normalizeAssignments = (data) => {
    return data.map((assignment) => ({
      ...assignment,
      isReturned: isReturned(assignment),
    }));
  };

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const status = isReturned(assignment)
        ? "Returned"
        : "Active";

      return statusFilters[status];
    });
  }, [assignments, statusFilters]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAssignments.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedAssignments = filteredAssignments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const hasActiveAssignments = paginatedAssignments.some(
    (assignment) => !isReturned(assignment)
  );



  const handleToggleStatusFilter = () => {
    setShowStatusFilter((prev) => !prev);
  };

  const handleStatusFilterInputChange = (e) => {
    handleStatusFilterChange(e.target.value);
  };

  const handleReturnClick = (e) => {
    handleReturn(e.currentTarget.dataset.assignmentId);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(1);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilters((prevFilters) => ({
      ...prevFilters,
      [status]: !prevFilters[status],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setAssignData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
      form: "",
    }));
  };

  const handleAssign = async () => {
    const payload = {
      assetId: assignData.assetId.trim(),
      employeeId: assignData.employeeId.trim(),
      conditionAtIssue: assignData.conditionAtIssue.trim(),
    };

    const nextErrors = {};

    if (!payload.assetId) {
      nextErrors.assetId = "Asset ID is required.";
    }

    if (!payload.employeeId) {
      nextErrors.employeeId = "Employee ID is required.";
    }

    if (payload.assetId && isAssetAlreadyAssigned()) {
      nextErrors.assetId =
        "Asset is already assigned and not yet returned.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      await assignAsset(payload);

      setAssignData(INITIAL_ASSIGNMENT_FORM);
      setErrors({});

      loadAssignments();
    } catch (error) {
      console.error("Assignment failed", error);

      setErrors({
        form: getApiErrorMessage(
          error,
          "Assignment failed."
        ),
      });
    }
  };

  const isAssetAlreadyAssigned = () => {
    return assignments.some((assignment) => {
      return (
        String(assignment.assetId) ===
          String(assignData.assetId) &&
        !isReturned(assignment)
      );
    });
  };

  const loadAssignments = async () => {
    try {
      setLoading(true);

      const res = await getAssignments();

      setAssignments(
        normalizeAssignments(res.data || [])
      );
    } catch (error) {
      console.error(
        "Failed to load assignments",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (assignmentId) => {
    try {
      await returnAsset({
        assignmentId,
        conditionAtReturn: "Good",
      });

      setAssignments((prevAssignments) =>
        prevAssignments.map((assignment) =>
          (assignment.assignmentId ||
            assignment.id) === assignmentId
            ? {
                ...assignment,
                isReturned: true,
                actualReturnDate: new Date(),
              }
            : assignment
        )
      );
    } catch (error) {
      console.error("Return failed", error);

      setErrors({
        form: getApiErrorMessage(
          error,
          "Return failed."
        ),
      });
    }
  };

  return (
    <DashboardLayout
      role="Admin"
      title="Assignments"
    >
      <div className="page-header">
        <h1>Asset Assignment</h1>
      </div>

      <div className="card assignment-form-card">
        <div className="section-title">
          <i className="fas fa-link text-muted" />
          <span>Assign Asset</span>
        </div>

        {errors.form && (
          <div className="form-error-banner">
            {errors.form}
          </div>
        )}

        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">
              Asset ID *
            </label>

            <input
              className={`form-control ${
                errors.assetId ? "is-invalid" : ""
              }`}
              type="text"
              name="assetId"
              placeholder="e.g. 1"
              value={assignData.assetId}
              onChange={handleChange}
            />

            {errors.assetId && (
              <p className="field-error">
                {errors.assetId}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Employee ID *
            </label>

            <input
              className={`form-control ${
                errors.employeeId
                  ? "is-invalid"
                  : ""
              }`}
              type="text"
              name="employeeId"
              placeholder="e.g. 5"
              value={assignData.employeeId}
              onChange={handleChange}
            />

            {errors.employeeId && (
              <p className="field-error">
                {errors.employeeId}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Condition at Issue
            </label>

            <input
              className="form-control"
              type="text"
              name="conditionAtIssue"
              placeholder="e.g. Excellent"
              value={assignData.conditionAtIssue}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions-right">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAssign}
          >
            <i className="fas fa-link" />
            Assign Asset
          </button>
        </div>
      </div>

      <div className="card">
        <div className="section-title">
          <i className="fas fa-clock-rotate-left text-muted" />
          <span>Assignment History</span>
        </div>

        {loading ? (
          <div className="empty-state">
            <i className="fas fa-spinner fa-spin" />
            <p>Loading...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox" />
            <p>
              No assignments found for selected
              filters.
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Asset Name</th>

                  <th>Employee Name</th>

                  <th>Issued</th>

                  <th>Return Date</th>

                  <th className="status-filter-header">
                    <button
                      type="button"
                      className="status-filter-button"
                      onClick={handleToggleStatusFilter}
                    >
                      Status{" "}
                      <i className="fas fa-filter" />
                    </button>

                    {showStatusFilter && (
                      <div className="status-filter-overlay">
                        {Object.keys(
                          INITIAL_STATUS_FILTERS
                        ).map((status) => (
                          <label
                            key={status}
                            className="filter-check-row"
                          >
                            <input
                              type="checkbox"
                              value={status}
                              checked={
                                statusFilters[status]
                              }
                              onChange={handleStatusFilterInputChange}
                            />
                            {status}
                          </label>
                        ))}
                      </div>
                    )}
                  </th>

                  {hasActiveAssignments && (
                    <th>Action</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {paginatedAssignments.map(
                  (assignment) => {
                    const assignmentId =
                      assignment.assignmentId ||
                      assignment.id;

                    const returned =
                      isReturned(assignment);

                    return (
                      <tr key={assignmentId}>
                        <td className="asset-name">
                          {assignment.assetName ||
                            `Asset #${assignment.assetId}`}
                        </td>

                        <td>
                          {assignment.employeeName ||
                            `Employee #${assignment.employeeId}`}
                        </td>

                        <td className="td-mono">
                          {formatDate(
                            assignment.issuedDate
                          )}
                        </td>

                        <td className="td-mono">
                          {formatDate(
                            assignment.returnDate ||
                              assignment.actualReturnDate
                          )}
                        </td>

                        <td>
                          <span
                            className={`badge ${
                              returned
                                ? "badge-green"
                                : "badge-warn"
                            }`}
                          >
                            {returned
                              ? "Returned"
                              : "Active"}
                          </span>
                        </td>

                        {hasActiveAssignments && (
                          <td>
                            {!returned && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                data-assignment-id={assignmentId}
                                  onClick={handleReturnClick}
                              >
                                <i className="fas fa-rotate-left" />
                                Return
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>

            <Pagination
              page={currentPage}
              pageSize={pageSize}
              totalItems={
                filteredAssignments.length
              }
              onPageChange={setPage}
              onPageSizeChange={
                handlePageSizeChange
              }
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AssignAsset;