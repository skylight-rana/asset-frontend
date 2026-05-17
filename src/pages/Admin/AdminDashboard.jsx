import { useEffect, useMemo, useState } from "react";

import Sidebar from "../../components/Sidebar/Sidebar";
import { getAssignments } from "../../services/assignmentService";
import { getAssets } from "../../services/assetService";
import { getEmployees } from "../../services/employeeService";
import { getTickets } from "../../services/ticketService";

import "./AdminDashboard.css";

const STATS_CONFIG = [
  {
    label: "Total Assets",
    icon: "fa-box",
    className: "stat-blue",
    key: "assets",
  },
  {
    label: "Total Tickets",
    icon: "fa-ticket",
    className: "stat-warn",
    key: "tickets",
  },
  {
    label: "Assignments",
    icon: "fa-link",
    className: "stat-green",
    key: "assignments",
  },
  {
    label: "Employees",
    icon: "fa-users",
    className: "stat-purple",
    key: "employees",
  },
];

function AdminDashboard() {
  const [assets, setAssets] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setUser(getStoredUser());
    loadDashboardData();
  }, []);

  const dashboardStats = {
    assets: assets.length,
    tickets: tickets.length,
    assignments: assignments.length,
    employees: employees.length,
  };

  const filteredEmployees = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) return employees;

    return employees.filter((employee) => {
      const employeeName = employee.name?.toLowerCase() || "";
      const employeeId = String(employee.id || "");

      return (
        employeeName.includes(searchValue) ||
        employeeId.includes(searchValue)
      );
    });
  }, [employees, search]);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);

      const [assetRes, ticketRes, assignmentRes, employeeRes] =
        await Promise.all([
          getAssets(),
          getTickets(),
          getAssignments(),
          getEmployees(),
        ]);

      setAssets(assetRes.data || []);
      setTickets(ticketRes.data || []);
      setAssignments(assignmentRes.data || []);
      setEmployees(employeeRes.data || []);
    } catch (error) {
      console.error("Dashboard load error", error);
    } finally {
      setRefreshing(false);
    }
  };

  function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    console.error("Invalid user data in localStorage", error);
    localStorage.removeItem("user");
    return null;
  }
}

  return (
    <div className="app-layout">
      <Sidebar role="Admin" />

      <main className="main">
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
            type="button"
            className={`btn btn-secondary btn-sm ${
              refreshing ? "refreshing" : ""
            }`}
            onClick={loadDashboardData}
            disabled={refreshing}
          >
            <i className="fas fa-rotate-right" />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        <div className="content">
          <div className="page-header">
            <div>
              <p className="page-eyebrow">Overview</p>
              <h1>Admin Dashboard</h1>
            </div>
          </div>

          <div className="stats-grid">
            {STATS_CONFIG.map((stat) => (
              <div
                key={stat.key}
                className={`stat-card ${stat.className}`}
              >
                <div className="stat-icon">
                  <i className={`fas ${stat.icon}`} />
                </div>

                <div className="stat-label">{stat.label}</div>

                <div className="stat-val">
                  {dashboardStats[stat.key]}
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="section-title">
              <span>Employees</span>

              <div className="filter-bar">
                <div className="header-search">
                  <i className="fas fa-search" />

                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {filteredEmployees.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-users" />
                <p>
                  {search
                    ? "No employees match your search."
                    : "No employees found."}
                </p>
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
                    {filteredEmployees.map((employee, index) => (
                      <tr key={employee.id}>
                        <td className="td-mono">{index + 1}</td>

                        <td>
                          <span className="badge badge-gray td-mono">
                            {employee.id}
                          </span>
                        </td>

                        <td className="employee-name">
                          {employee.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;