import { useEffect, useState } from "react";

import { INITIAL_TICKET_STATUS, TICKET_STATUS_OPTIONS } from "../../constants";
import { DashboardLayout } from "../../layouts";
import { getEmployees, getTickets, updateTicket } from "../../services";
import {
  getApiErrorMessage,
  getTicketEmployeeName,
  getTicketStatusBadgeClass,
} from "../../utils";

import "./UpdateTicket.css";

function UpdateTicket() {
  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [ticketId, setTicketId] = useState("");
  const [newStatus, setNewStatus] = useState(INITIAL_TICKET_STATUS);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);

      const [ticketRes, employeeRes] = await Promise.all([
        getTickets(),
        getEmployees(),
      ]);

      setTickets(ticketRes.data || []);
      setEmployees(employeeRes.data || []);
    } catch (error) {
      console.error("Failed to load tickets", error);
    } finally {
      setLoading(false);
    }
  };



  const handleTicketIdChange = (e) => {
    setTicketId(e.target.value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      ticketId: "",
      form: "",
    }));
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      status: "",
      form: "",
    }));
  };

  const handleUpdate = async () => {
    const selectedTicketId = ticketId.trim();
    const nextErrors = {};

    if (!selectedTicketId) {
      nextErrors.ticketId = "Ticket ID is required.";
    }

    if (!newStatus) {
      nextErrors.status = "Please select a status.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      await updateTicket(selectedTicketId, {
        status: newStatus,
        resolutionNotes: "",
      });

      setTicketId("");
      setNewStatus(INITIAL_TICKET_STATUS);
      setErrors({});

      loadTickets();
    } catch (error) {
      console.error("Failed to update ticket", error);
      setErrors({
        form: getApiErrorMessage(
          error,
          "Update failed. Please check the ticket ID and try again."
        ),
      });
    }
  };

  return (
    <DashboardLayout role="Admin" title="Tickets">
      <div className="page-header">
        <h1>Update Ticket</h1>
      </div>

      <div className="card update-ticket-card">
        <div className="section-title">
          <i className="fas fa-pen-to-square text-muted" />
          <span>Change Ticket Status</span>
        </div>

        {errors.form && <div className="form-error-banner">{errors.form}</div>}

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Ticket ID *</label>

            <input
              className={`form-control ${errors.ticketId ? "is-invalid" : ""}`}
              type="text"
              placeholder="e.g. 3"
              value={ticketId}
              onChange={handleTicketIdChange}
            />
            {errors.ticketId && (
              <p className="field-error">{errors.ticketId}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">New Status</label>

            <select
              className={`form-control ${errors.status ? "is-invalid" : ""}`}
              value={newStatus}
              onChange={handleStatusChange}
            >
              {TICKET_STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            {errors.status && <p className="field-error">{errors.status}</p>}
          </div>
        </div>

        <div className="form-actions-right">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUpdate}
          >
            <i className="fas fa-check" />
            Update Status
          </button>
        </div>
      </div>

      <div className="card">
        <div className="section-title">
          <i className="fas fa-ticket text-muted" />
          <span>All Tickets</span>
        </div>

        {loading ? (
          <div className="empty-state">
            <i className="fas fa-spinner fa-spin" />
            <p>Loading...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox" />
            <p>No tickets found.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee Name</th>
                  <th>Issue</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="td-mono">#{ticket.id}</td>

                    <td>{getTicketEmployeeName(ticket, employees)}</td>

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

export default UpdateTicket;