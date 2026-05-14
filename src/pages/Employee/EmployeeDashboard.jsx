import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./EmployeeDashboard.css";

function EmployeeDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem("user"))); } catch { }
  }, []);

  return (
    <div className="app-layout">
      <Sidebar role="Employee" />
      <div className="main">
        <header className="top-header">
          <span className="page-title">Dashboard</span>
          <div className="header-spacer" />
          {user && (
            <span className="header-user">
              <i className="fas fa-user-circle" />
              {user.username}
            </span>
          )}
        </header>

        <div className="content">
          <div className="page-header">
            <div>
              <p className="page-eyebrow">Employee Portal</p>
              <h1>
                {user ? `Welcome, ${user.username}` : "Employee Dashboard"}
              </h1>
            </div>
          </div>

          <div className="card welcome-card">
            <div className="welcome-icon">
              <i className="fas fa-layer-group" />
            </div>
            <div>
              <h3>Getting Started</h3>
              <p>Use the navigation on the left to raise support tickets or track existing ones. If you need help, contact your IT administrator.</p>
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: 20 }}>
            <div className="card quick-link">
              <i className="fas fa-plus-circle" />
              <div>
                <h4>Raise a Ticket</h4>
                <p>Report an issue with your IT equipment or software.</p>
              </div>
            </div>
            <div className="card quick-link">
              <i className="fas fa-list-check" />
              <div>
                <h4>Track Tickets</h4>
                <p>View status updates on your submitted requests.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;