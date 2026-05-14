import { useEffect, useState } from "react";
import { getAssets } from "../../services/assetService";
import { getTickets } from "../../services/ticketService";
import { getAssignments } from "../../services/assignmentService";
import { getEmployees } from "../../services/employeeService";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [assets, setAssets] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
    try { setUser(JSON.parse(localStorage.getItem("user"))); } catch { }
  }, []);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [aR, tR, asR, eR] = await Promise.all([
        getAssets(), getTickets(), getAssignments(), getEmployees(),
      ]);
      setAssets(aR.data);
      setTickets(tR.data);
      setAssignments(asR.data);
      setEmployees(eR.data);
    } catch (err) {
      console.error("Dashboard load error", err);
    } finally {
      setRefreshing(false);
    }
  };

  const filtered = employees.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    String(e.id).includes(search)
  );

  return (
    <div className="app-layout">
      <Sidebar role="Admin" />

      <div className="main">
        {/* Top header */}
        <header className="top-header">
          <span className="page-title">Dashboard</span>
          <div className="header-spacer" />
          {user && (
            <span className="header-user">
              <i className="fas fa-user-circle" />
              {user.username}
            </span>
          )}
          <button
            className={`btn btn-secondary btn-sm${refreshing ? " refreshing" : ""}`}
            onClick={loadData}
            disabled={refreshing}
          >
            <i className="fas fa-rotate-right" />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </header>

        <div className="content">
          {/* Page header */}
          <div className="page-header">
            <div>
              <p className="page-eyebrow">Overview</p>
              <h1>Admin Dashboard</h1>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card stat-blue">
              <div className="stat-icon"><i className="fas fa-box" /></div>
              <div className="stat-label">Total Assets</div>
              <div className="stat-val">{assets.length}</div>
            </div>
            <div className="stat-card stat-warn">
              <div className="stat-icon"><i className="fas fa-ticket" /></div>
              <div className="stat-label">Total Tickets</div>
              <div className="stat-val">{tickets.length}</div>
            </div>
            <div className="stat-card stat-green">
              <div className="stat-icon"><i className="fas fa-link" /></div>
              <div className="stat-label">Assignments</div>
              <div className="stat-val">{assignments.length}</div>
            </div>
            <div className="stat-card stat-purple">
              <div className="stat-icon"><i className="fas fa-users" /></div>
              <div className="stat-label">Employees</div>
              <div className="stat-val">{employees.length}</div>
            </div>
          </div>

          {/* Employee table */}
          <div className="card">
            <div className="section-title">
              <span>Employees</span>
              <div className="filter-bar" style={{ margin: 0 }}>
                <div className="header-search">
                  <i className="fas fa-search" />
                  <input
                    placeholder="Search employees…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-users" />
                <p>{search ? "No employees match your search." : "No employees found."}</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Employee ID</th>
                      <th>Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((emp, i) => (
                      <tr key={emp.id}>
                        <td className="td-mono">{i + 1}</td>
                        <td><span className="badge badge-gray td-mono">{emp.id}</span></td>
                        <td style={{ fontWeight: 500 }}>{emp.name}</td>
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

export default AdminDashboard;