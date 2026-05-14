import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { getTickets, createTicket } from "../../services/ticketService";
import "./Tickets.css";

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [issue,   setIssue]   = useState("");
  const [loading, setLoading] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    try { const res = await getTickets(); setTickets(res.data); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadTickets(); }, []);

  const handleSubmit = async () => {
    if (!issue.trim()) { alert("Please enter issue"); return; }
    try {
      await createTicket({ issueDescription: issue });
      setIssue("");
      loadTickets();
    } catch { alert("Failed to create ticket"); }
  };

  const statusBadge = (s) => {
    if (s === "Open")       return "badge-warn";
    if (s === "InProgress") return "badge-blue";
    return "badge-green";
  };

  return (
    <div className="app-layout">
      <Sidebar role="Employee" />
      <div className="main">
        <header className="top-header">
          <span className="page-title">My Tickets</span>
          <div className="header-spacer" />
        </header>

        <div className="content">
          <div className="page-header">
            <h1>Raise & Track Tickets</h1>
          </div>

          {/* Raise form */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-title">
              <i className="fas fa-plus-circle text-muted" />
              <span>Raise a Ticket</span>
            </div>

            <div className="form-group">
              <label className="form-label">Issue Description *</label>
              <input
                className="form-control"
                placeholder="Describe your issue…"
                value={issue}
                onChange={e => setIssue(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleSubmit}>
                <i className="fas fa-paper-plane" /> Submit Ticket
              </button>
            </div>
          </div>

          {/* Tickets table */}
          <div className="card">
            <div className="section-title">
              <i className="fas fa-ticket text-muted" />
              <span>All Tickets</span>
              {/* <span className="badge badge-gray">{tickets.length}</span> */}
            </div>

            {loading ? (
              <div className="empty-state"><i className="fas fa-spinner fa-spin" /><p>Loading…</p></div>
            ) : tickets.length === 0 ? (
              <div className="empty-state"><i className="fas fa-inbox" /><p>No tickets yet.</p></div>
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
                    {tickets.map(t => (
                      <tr key={t.id}>
                        <td className="td-mono">#{t.id}</td>
                        <td>{t.issueDescription}</td>
                        <td><span className={`badge ${statusBadge(t.status)}`}>{t.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tickets;