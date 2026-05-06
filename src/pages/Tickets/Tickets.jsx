import { useEffect, useState } from "react";
import { getTickets, createTicket } from "../../services/ticketService";

import EmployeeNavbar from "../../components/EmployeeNavbar/EmployeeNavbar";

import "./Tickets.css";

function Tickets() {

  const [tickets, setTickets] = useState([]);
  const [issue, setIssue] = useState("");
  const [loading, setLoading] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await getTickets();
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSubmit = async () => {

    if (!issue.trim()) {
      alert("Please enter issue");
      return;
    }

    try {
      await createTicket({ issueDescription: issue });
      setIssue("");
      loadTickets();
    } catch {
      alert("Failed to create ticket");
    }
  };

  const getStatusClass = (status) => {
    if (status === "Open") return "status open";
    if (status === "InProgress") return "status progress";
    return "status closed";
  };

  return (
    <div className="tickets-container">

      {/* HEADER (same as Assets) */}
      <div className="header">
        <h2>Ticket Management</h2>
      </div>

      {/* NAVBAR */}
     <EmployeeNavbar />

      {/* CREATE TICKET (same card style as Assets form) */}
      <div className="card">

        <h3>Raise Ticket</h3>

        <div className="form-group">
          <input
            placeholder="Describe your issue..."
            value={issue}
            onChange={e => setIssue(e.target.value)}
          />
        </div>

        <div className="btn-group">
          <button className="btn primary" onClick={handleSubmit}>
            Raise Ticket
          </button>
        </div>

      </div>

      {/* TABLE (same structure as Assets table) */}
      <div className="card">

        <h3>All Tickets ({tickets.length})</h3>

        {loading ? (
          <p className="empty">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p className="empty">No tickets found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Issue</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map(t => (
                <tr key={t.id}>
                  <td>#{t.id}</td>
                  <td>{t.issueDescription}</td>

                  <td>
                    <span className={getStatusClass(t.status)}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>

    </div>
  );
}

export default Tickets;