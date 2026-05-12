import { useEffect, useState } from "react";
import { updateTicketStatus } from "../../services/adminService";
import { getTickets } from "../../services/ticketService";

import Navbar from "../../components/Navbar/Navbar";

import "./UpdateTicket.css";

function UpdateTicket() {

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    ticketId: "",
    status: "",
    resolutionNotes: ""
  });

  // LOAD TICKETS
  const loadTickets = async () => {

    setLoading(true);

    try {

      const res = await getTickets();
      setTickets(res.data);

    } catch (err) {

      console.error("Error loading tickets:", err);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // UPDATE TICKET
  const handleSubmit = async () => {

    if (!form.ticketId || !form.status) {
      alert("Ticket ID and Status are required");
      return;
    }

    try {

      const payload = {
        ticketId: parseInt(form.ticketId),
        status: form.status,
        resolutionNotes: form.resolutionNotes || ""
      };

      console.log("Payload:", payload);

      const res = await updateTicketStatus(payload);

      console.log("Update Response:", res.data);

      alert("Ticket updated successfully");

      setForm({
        ticketId: "",
        status: "",
        resolutionNotes: ""
      });

      loadTickets();

    } catch (err) {

      console.error("FULL ERROR:", err);

      if (err.response) {

        console.log("Backend Error:", err.response.data);
        console.log("Status Code:", err.response.status);

        alert(
          err.response.data?.message ||
          "Backend validation failed"
        );

      } else {

        alert("Update failed");

      }
    }
  };

  return (
    <div className="update-container">

      {/* HEADER */}
      <div className="header">
        <h2>Update Ticket</h2>
      </div>

      {/* NAVBAR */}
      <Navbar />

      {/* FORM */}
      <div className="card">

        <h3>Update Ticket Status</h3>

        <div className="form-group">

          <input
            type="number"
            placeholder="Ticket ID"
            value={form.ticketId}
            onChange={e =>
              setForm({
                ...form,
                ticketId: e.target.value
              })
            }
          />

          <select
            value={form.status}
            onChange={e =>
              setForm({
                ...form,
                status: e.target.value
              })
            }
          >
            <option value="">
              Select Status
            </option>

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

          <input
            placeholder="Resolution Notes"
            value={form.resolutionNotes}
            onChange={e =>
              setForm({
                ...form,
                resolutionNotes: e.target.value
              })
            }
          />

        </div>

        <div className="btn-group">

          <button
            className="btn primary"
            onClick={handleSubmit}
          >
            Update Ticket
          </button>

        </div>

      </div>

      {/* TABLE */}
      <div className="card">

        <h3>
          All Tickets ({tickets.length})
        </h3>

        {loading ? (

          <p className="empty">
            Loading...
          </p>

        ) : tickets.length === 0 ? (

          <p className="empty">
            No tickets found
          </p>

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

                    <span
                      className={`status ${
                        t.status === "Open"
                          ? "open"
                          : t.status === "InProgress"
                          ? "progress"
                          : "closed"
                      }`}
                    >
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

export default UpdateTicket;