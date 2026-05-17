import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getTickets, updateTicket } from "../../services/ticketService";

import "./UpdateTicket.css";

const INITIAL_STATUS = "InProgress";

const STATUS_OPTIONS = [
  { label: "Open", value: "Open" },
  { label: "In Progress", value: "InProgress" },
  { label: "Resolved", value: "Resolved" },
  { label: "Closed", value: "Closed" },
];

function UpdateTicket() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [ticketId, setTicketId] = useState("");
  const [newStatus, setNewStatus] = useState(INITIAL_STATUS);

  useEffect(() => {
    loadTickets();
  }, []);

  const handleUpdate = async () => {
    const selectedTicketId = ticketId.trim();

    if (!selectedTicketId) {
      alert("Please enter Ticket ID");
      return;
    }

    try {
      await updateTicket(selectedTicketId, {
        status: newStatus,
        resolutionNotes: "",
      });

      alert("Ticket updated");

      setTicketId("");
      setNewStatus(INITIAL_STATUS);

      loadTickets();
    } catch (error) {
      console.error("Failed to update ticket", error);
      alert("Update failed");
    }
  };

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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Open":
        return "badge-warn";

      case "InProgress":
        return "badge-blue";

      default:
        return "badge-green";
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

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Ticket ID *</label>

            <input
              className="form-control"
              type="text"
              placeholder="e.g. 3"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Status</label>

            <select
              className="form-control"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
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
                  <th>Issue</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="td-mono">#{ticket.id}</td>

                    <td>{ticket.issueDescription}</td>

                    <td>
                      <span
                        className={`badge ${getStatusBadgeClass(
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