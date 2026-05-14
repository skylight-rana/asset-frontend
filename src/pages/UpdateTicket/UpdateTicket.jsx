import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";

import {
  getTickets,
  updateTicket
} from "../../services/ticketService";

import "./UpdateTicket.css";

function UpdateTicket() {

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [ticketId, setTicketId] = useState("");
  const [newStatus, setNewStatus] = useState("InProgress");

  // LOAD TICKETS
  const loadTickets = async () => {

    setLoading(true);

    try {

      const res = await getTickets();
      setTickets(res.data);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    loadTickets();

  }, []);

  // UPDATE TICKET
  const handleUpdate = async () => {

    if (!ticketId.trim()) {

      alert("Please enter Ticket ID");
      return;

    }

    try {

      await updateTicket(ticketId, {
        status: newStatus,
        resolutionNotes: ""
      });

      alert("Ticket updated");

      setTicketId("");
      setNewStatus("InProgress");

      loadTickets();

    } catch (err) {

      console.error(err);

      alert("Update failed");

    }
  };

  // STATUS BADGE
  const statusBadge = (status) => {

    if (status === "Open") {
      return "badge-warn";
    }

    if (status === "InProgress") {
      return "badge-blue";
    }

    return "badge-green";
  };

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <Sidebar role="Admin" />

      <div className="main">

        {/* TOP HEADER */}
        <header className="top-header">

          <span className="page-title">
            Tickets
          </span>

          <div className="header-spacer" />

        </header>

        <div className="content">

          {/* PAGE HEADER */}
          <div className="page-header">

            <h1>
              Update Ticket
            </h1>

          </div>

          {/* UPDATE FORM */}
          <div
            className="card"
            style={{ marginBottom: 24 }}
          >

            <div className="section-title">

              <i className="fas fa-pen-to-square text-muted" />

              <span>
                Change Ticket Status
              </span>

            </div>

            <div className="form-grid">

              {/* TICKET ID */}
              <div className="form-group">

                <label className="form-label">
                  Ticket ID *
                </label>

                <input
                  className="form-control"
                  placeholder="e.g. 3"
                  value={ticketId}
                  onChange={e =>
                    setTicketId(e.target.value)
                  }
                />

              </div>

              {/* STATUS */}
              <div className="form-group">

                <label className="form-label">
                  New Status
                </label>

                <select
                  className="form-control"
                  value={newStatus}
                  onChange={e =>
                    setNewStatus(e.target.value)
                  }
                >

                  <option value="Open">
                    Open
                  </option>

                  <option value="InProgress">
                    In Progress
                  </option>

                  <option value="Resolved">
                    Resolved
                  </option>

                  <option value="Closed">
                    Closed
                  </option>

                </select>

              </div>

            </div>

            {/* BUTTON */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end"
              }}
            >

              <button
                className="btn btn-primary"
                onClick={handleUpdate}
              >

                <i className="fas fa-check" />

                {" "}
                Update Status

              </button>

            </div>

          </div>

          {/* TICKETS TABLE */}
          <div className="card">

            <div className="section-title">

              <i className="fas fa-ticket text-muted" />

              <span>
                All Tickets
              </span>

              {/* <span className="badge badge-gray">
                {tickets.length}
              </span> */}

            </div>

            {loading ? (

              <div className="empty-state">

                <i className="fas fa-spinner fa-spin" />

                <p>
                  Loading…
                </p>

              </div>

            ) : tickets.length === 0 ? (

              <div className="empty-state">

                <i className="fas fa-inbox" />

                <p>
                  No tickets found.
                </p>

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

                    {tickets.map(t => (

                      <tr key={t.id}>

                        <td className="td-mono">
                          #{t.id}
                        </td>

                        <td>
                          {t.issueDescription}
                        </td>

                        <td>

                          <span
                            className={`badge ${statusBadge(t.status)}`}
                          >
                            {t.status}
                          </span>

                        </td>

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

export default UpdateTicket;