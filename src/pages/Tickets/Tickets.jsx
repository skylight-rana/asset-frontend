import { useEffect, useMemo, useState } from "react";

import { DashboardLayout } from "../../layouts";
import { getAssignments, createTicket, getTickets } from "../../services";
import {
  belongsToEmployee,
  getPrimaryEmployeeId,
  getApiErrorMessage,
  getTicketStatusBadgeClass,
  getUser,
  isReturned,
} from "../../utils";

import "./Tickets.css";

function Tickets() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [issue, setIssue] = useState("");
  const [assetId, setAssetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const storedUser = getUser();
    setUser(storedUser);
    loadTickets();
    loadAssignments();
  }, []);

  const employeeId = getPrimaryEmployeeId(user);

  const myAssignedAssets = useMemo(() => {
    return assignments.filter(
      (assignment) =>
        belongsToEmployee(assignment, user) &&
        !isReturned(assignment)
    );
  }, [assignments, user]);

  const myTickets = useMemo(() => {
    return tickets.filter((ticket) => belongsToEmployee(ticket, user));
  }, [tickets, user]);

  const loadTickets = async () => {
    try {
      setLoading(true);

      const res = await getTickets();
      setTickets(res.data || []);
    } catch (error) {
      console.error("Failed to load tickets", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      const res = await getAssignments();
      setAssignments(res.data || []);
    } catch (error) {
      console.error("Failed to load assignments", error);
    }
  };

  const handleAssetChange = (e) => {
    setAssetId(e.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, assetId: "", form: "" }));
  };

  const handleIssueChange = (e) => {
    setIssue(e.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, issue: "", form: "" }));
  };

  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
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
      loadTickets();
    } catch (error) {
      console.error("Failed to create ticket", error);
      setErrors({ form: getApiErrorMessage(error, "Failed to create ticket.") });
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
            <p className="field-help">No active assigned assets found for your login.</p>
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
            onKeyDown={handleEnterKey}
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
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Asset ID</th>
                  <th>Issue</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {myTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="td-mono">#{ticket.id}</td>

                    <td className="td-mono">{ticket.assetId}</td>

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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Tickets;
