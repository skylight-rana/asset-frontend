import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import { createTicket, getTickets } from "../../services/ticketService";

import "./Tickets.css";

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [issue, setIssue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);
  
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

  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const payload = {
      issueDescription: issue.trim(),
    };

    if (!payload.issueDescription) {
      alert("Please enter issue");
      return;
    }

    try {
      await createTicket(payload);

      setIssue("");
      loadTickets();
    } catch (error) {
      console.error("Failed to create ticket", error);
      alert("Failed to create ticket");
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
    <DashboardLayout role="Employee" title="My Tickets">
      <div className="page-header">
        <h1>Raise & Track Tickets</h1>
      </div>

      <div className="card ticket-form-card">
        <div className="section-title">
          <i className="fas fa-plus-circle text-muted" />
          <span>Raise a Ticket</span>
        </div>

        <div className="form-group">
          <label className="form-label">
            Issue Description *
          </label>

          <input
            className="form-control"
            type="text"
            placeholder="Describe your issue..."
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            onKeyDown={handleEnterKey}
          />
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
            <p>No tickets yet.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Issue</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="td-mono">
                      #{ticket.id}
                    </td>

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

export default Tickets;