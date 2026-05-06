import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { logout } from "../../utils/auth";

import { getAssets } from "../../services/assetService";
import { getTickets } from "../../services/ticketService";
import { getAssignments } from "../../services/assignmentService";

import "./AdminDashboard.css";

import Navbar from "../../components/Navbar/Navbar";

function AdminDashboard() {

  const [assets, setAssets] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [user, setUser] = useState(null);

  const loadData = async() => {
    try {
      const assetRes = await getAssets();
      const ticketRes = await getTickets();
      const assignmentRes = await getAssignments();

      setAssets(assetRes.data);
      setTickets(ticketRes.data);
      setAssignments(assignmentRes.data);
    } catch (err) {
      console.error("Error loading dashboard data", err);
    }
  };

  useEffect(() => {
    loadData();

    const loggedUser = JSON.parse(localStorage.getItem("user"));
    setUser(loggedUser);

  }, []);

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div>
          <h2>Admin Dashboard</h2>

          {user && (
            <p className="welcome-text">
              Welcome, <b>{user.username}</b>
            </p>
          )}
        </div>

        {/* <button onClick={logout} className="logout-btn">
          Logout
        </button> */}
      </header>

      {/* Navigation */}
      <Navbar />

      {/* Summary */}
      <section className="card-summary-grid">

        <div className="summary-box">
          <h3>{assets.length}</h3>
          <p>Total Assets</p>
        </div>

        <div className="summary-box">
          <h3>{tickets.length}</h3>
          <p>Total Tickets</p>
        </div>

        <div className="summary-box">
          <h3>{assignments.length}</h3>
          <p>Total Assignments</p>
        </div>
      </section>

      {/* Info */}
      {/* <section className="card">
        <h3>System Overview</h3>
        <p>
          Manage company assets, employee assignments, & IT tickets from here
        </p>
      </section> */}

      {/* Refresh */}
      <button onClick={loadData} className="refresh-btn">
        Refresh Data
      </button>
    </div>
  );
}

export default AdminDashboard;