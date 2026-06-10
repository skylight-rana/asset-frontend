import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { DetailsModal, Pagination } from "../../components";
import { DEFAULT_PAGE_SIZE } from "../../constants";
import { DashboardLayout } from "../../layouts";
import {
  createTicket,
  getAssets,
  getAssignments,
  getTickets,
} from "../../services";
import {
  belongsToEmployee,
  getApiErrorMessage,
  getPrimaryEmployeeId,
  getTicketStatusBadgeClass,
  getUser,
  isReturned,
} from "../../utils";

import "./Tickets.css";

function Tickets() {
  const [searchParams] = useSearchParams();

  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assets, setAssets] = useState([]);

  const [issue, setIssue] = useState("");
  const [assetId, setAssetId] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    const storedUser = getUser();
    const presetAssetId = searchParams.get("assetId");

    setUser(storedUser);
    loadData();

    if (presetAssetId) {
      setAssetId(presetAssetId);
    }
  }, [searchParams]);

  const employeeId = getPrimaryEmployeeId(user);

  const myAssignedAssets = useMemo(() => {
    return assignments.filter(
      (assignment) =>
        belongsToEmployee(assignment, user) && !isReturned(assignment)
    );
  }, [assignments, user]);

  const myTickets = useMemo(() => {
    return tickets.filter((ticket) => belongsToEmployee(ticket, user));
  }, [tickets, user]);

  const totalPages = Math.max(1, Math.ceil(myTickets.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedTickets = myTickets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const loadData = async () => {
    try {
      setLoading(true);

      const [ticketRes, assignmentRes, assetRes] = await Promise.all([
        getTickets(),
        getAssignments(),
        getAssets(),
      ]);

      setTickets(ticketRes.data || []);
      setAssignments(assignmentRes.data || []);
      setAssets(assetRes.data || []);
    } catch (error) {
      console.error("Failed to load tickets", error);
    } finally {
      setLoading(false);
    }
  };

  const getAssetById = (id) => {
    return assets.find((asset) => String(asset.id) === String(id));
  };

  const getAssetName = (ticket) => {
    return (
      ticket.assetName ||
      getAssetById(ticket.assetId)?.name ||
      `Asset #${ticket.assetId}`
    );
  };

  const handleAssetChange = (e) => {
    setAssetId(e.target.value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      assetId: "",
      form: "",
    }));
  };

  const handleIssueChange = (e) => {
    setIssue(e.target.value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      issue: "",
      form: "",
    }));
  };

  const handleIssueKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(1);
  };

  const handleSubmit = async () => {
    const payload = {
      employeeId: Number(employeeId),
      assetId: Number(assetId),
      issueDescription: issue.trim(),
    };

    const nextErrors = {};

    if (!payload.employeeId) {
      nextErrors.form = "Employee ID not found. Please logout and login again.";
    }

    if (!payload.assetId) {
      nextErrors.assetId = "Please select an assigned asset.";
    }

    if (!payload.issueDescription) {
      nextErrors.issue = "Please enter issue description.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      await createTicket(payload);

      setIssue("");
      setAssetId("");
      setErrors({});

      loadData();
    } catch (error) {
      setErrors({
        form: getApiErrorMessage(error, "Failed to create ticket."),
      });
    }
  };

  return (
    <DashboardLayout role="Employee" title="My Tickets">
      <div className="page-header">
        <h1>Raise & Track Tickets</h1>
      </div>

      <div className="card ticket-form-card">
        <div className="section-title">
          <i className="fas fa-plus-circle text-muted" />
          <span>Raise a Ticket</span>
        </div>

        {errors.form && <div className="form-error-banner">{errors.form}</div>}

        <div className="form-group">
          <label className="form-label">Select Asset *</label>

          <select
            className={`form-control ${errors.assetId ? "is-invalid" : ""}`}
            value={assetId}
            onChange={handleAssetChange}
          >
            <option value="">Select assigned asset...</option>

            {myAssignedAssets.map((assignment) => (
              <option
                key={assignment.assignmentId || assignment.id}
                value={assignment.assetId}
              >
                {assignment.assetName || `Asset #${assignment.assetId}`}
              </option>
            ))}
          </select>

          {errors.assetId && <p className="field-error">{errors.assetId}</p>}

          {!errors.assetId && myAssignedAssets.length === 0 && (
            <p className="field-help">
              No active assigned assets found for your login.
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Issue Description *</label>

          <input
            className={`form-control ${errors.issue ? "is-invalid" : ""}`}
            type="text"
            placeholder="Describe your issue..."
            value={issue}
            onChange={handleIssueChange}
            onKeyDown={handleIssueKeyDown}
          />

          {errors.issue && <p className="field-error">{errors.issue}</p>}
        </div>

        <div className="form-actions-right">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
          >
            <i className="fas fa-paper-plane" />
            Submit Ticket
          </button>
        </div>
      </div>

      <div className="card">
        <div className="section-title">
          <i className="fas fa-ticket text-muted" />
          <span>My Tickets</span>
        </div>

        {loading ? (
          <div className="empty-state">
            <i className="fas fa-spinner fa-spin" />
            <p>Loading...</p>
          </div>
        ) : myTickets.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox" />
            <p>No tickets yet.</p>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Ticket #</th>
                    <th>Asset</th>
                    <th>Issue</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="td-mono">#{ticket.id}</td>

                      <td
                        className="clickable-text"
                        onClick={() => setSelectedAsset(getAssetById(ticket.assetId))}
                      >
                        {getAssetName(ticket)}
                      </td>

                      <td>{ticket.issueDescription}</td>

                      <td>
                        <span
                          className={`badge ${getTicketStatusBadgeClass(
                            ticket.status
                          )}`}
                        >
                          {ticket.status}
                        </span>
                      </td>

                      <td>
                        {ticket.assignedToEmployeeName ||
                          (ticket.assignedToEmployeeId
                            ? `Employee #${ticket.assignedToEmployeeId}`
                            : "Unassigned")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={currentPage}
              pageSize={pageSize}
              totalItems={myTickets.length}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </div>

      <DetailsModal
        title="Asset Details"
        open={Boolean(selectedAsset)}
        onClose={() => setSelectedAsset(null)}
      >
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Asset ID</span>
            <span className="detail-value">#{selectedAsset?.id}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Name</span>
            <span className="detail-value">{selectedAsset?.name}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Type</span>
            <span className="detail-value">{selectedAsset?.type}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Serial Number</span>
            <span className="detail-value">{selectedAsset?.serialNumber}</span>
          </div>
        </div>
      </DetailsModal>
    </DashboardLayout>
  );
}

export default Tickets;
