import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Pagination, Sidebar } from "../../components";
import { DASHBOARD_STATS, DEFAULT_PAGE_SIZE, ROUTES } from "../../constants";
import { getAssets, getAssignments, getEmployees, getTickets } from "../../services";
import {
  formatDate,
  getAssignmentAssetName,
  getTicketStatusBadgeClass,
  getUser,
  isReturned,
} from "../../utils";

import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    setUser(getUser());
    loadDashboardData();
  }, []);

  const activeAssignments = useMemo(() => {
    return assignments.filter((assignment) => !isReturned(assignment));
  }, [assignments]);

  const dashboardStats = {
    assets: assets.length,
    tickets: tickets.length,
    assignments: activeAssignments.length,
    employees: employees.length,
  };

  const statRoutes = {
    assets: `${ROUTES.ADMIN_ASSETS}#all-assets`,
    tickets: ROUTES.ADMIN_TICKETS,
    assignments: ROUTES.ADMIN_ASSIGNMENTS,
  };

  const getEmployeeAssignments = (employeeId) => {
    return activeAssignments.filter(
      (assignment) => String(assignment.employeeId) === String(employeeId)
    );
  };

  const getEmployeeTickets = (employeeId) => {
    return tickets.filter(
      (ticket) => String(ticket.employeeId) === String(employeeId)
    );
  };

  const employeeAssetRows = useMemo(() => {
    return employees.map((employee) => {
      const activeEmployeeAssignments = getEmployeeAssignments(employee.id);

      const assignedAssets = activeEmployeeAssignments.map((assignment) =>
        getAssignmentAssetName(assignment, assets)
      );

      return {
        ...employee,
        assignedAssets,
        assignedCount: assignedAssets.length,
        activeAssignments: activeEmployeeAssignments,
        raisedTickets: getEmployeeTickets(employee.id),
      };
    });
  }, [assets, activeAssignments, employees, tickets]);

  const filteredEmployees = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) return employeeAssetRows;

    return employeeAssetRows.filter((employee) => {
      const employeeName = employee.name?.toLowerCase() || "";
      const employeeEmail = employee.email?.toLowerCase() || "";
      const employeeId = String(employee.id || "");
      const assetNames = employee.assignedAssets.join(" ").toLowerCase();

      return (
        employeeName.includes(searchValue) ||
        employeeEmail.includes(searchValue) ||
        employeeId.includes(searchValue) ||
        assetNames.includes(searchValue)
      );
    });
  }, [employeeAssetRows, search]);

  const selectedEmployeeDetails = useMemo(() => {
    if (!selectedEmployee) return null;

    return employeeAssetRows.find(
      (employee) => String(employee.id) === String(selectedEmployee.id)
    );
  }, [employeeAssetRows, selectedEmployee]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };



  const handleSearchInputChange = (e) => {
    handleSearch(e.target.value);
  };

  const handleEmployeeSelect = (e) => {
    const employeeId = e.currentTarget.dataset.employeeId;
    const employee = employeeAssetRows.find(
      (item) => String(item.id) === String(employeeId)
    );

    setSelectedEmployee(employee || null);
  };

  const handleEmployeeRowKeyDown = (e) => {
    if (e.key === "Enter") {
      handleEmployeeSelect(e);
    }
  };

  const handleCloseEmployeeDetails = () => {
    setSelectedEmployee(null);
  };

  const handleEmployeeDetailPanelClick = (e) => {
    e.stopPropagation();
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(1);
  };

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
            {DASHBOARD_STATS.map((stat) => (
              <div key={stat.key} className={`stat-card ${stat.className} ${statRoutes[stat.key] ? "clickable-row" : ""}`} onClick={() => statRoutes[stat.key] && navigate(statRoutes[stat.key])}>
                <div className="stat-icon">
                  <i className={`fas ${stat.icon}`} />
                </div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-val">{dashboardStats[stat.key]}</div>
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
                    placeholder="Search employee or asset..."
                    value={search}
                    onChange={handleSearchInputChange}
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
              <>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Employee ID</th>
                        <th>Name</th>
                        <th>Assigned Assets</th>
                        <th>Tickets</th>
                        <th>Total Assets</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedEmployees.map((employee, index) => (
                        <tr
                          key={employee.id}
                          className="clickable-row"
                          tabIndex={0}
                          role="button"
                          data-employee-id={employee.id}
                          onClick={handleEmployeeSelect}
                          onKeyDown={handleEmployeeRowKeyDown}
                        >
                          <td className="td-mono">
                            {(currentPage - 1) * pageSize + index + 1}
                          </td>

                          <td>
                            <span className="badge badge-gray td-mono">
                              {employee.id}
                            </span>
                          </td>

                          <td className="employee-name">{employee.name}</td>

                          <td>
                            {employee.assignedAssets.length > 0 ? (
                              <div className="asset-chip-list">
                                {employee.assignedAssets.map(
                                  (assetName, assetIndex) => (
                                    <span
                                      className="badge badge-blue"
                                      key={`${employee.id}-${assetName}-${assetIndex}`}
                                    >
                                      {assetName}
                                    </span>
                                  )
                                )}
                              </div>
                            ) : (
                              <span className="text-muted">
                                No active assets
                              </span>
                            )}
                          </td>

                          <td>
                            <span className="badge badge-warn">
                              {employee.raisedTickets.length}
                            </span>
                          </td>

                          <td>
                            <span className="badge badge-green">
                              {employee.assignedCount}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  page={currentPage}
                  pageSize={pageSize}
                  totalItems={filteredEmployees.length}
                  onPageChange={setPage}
                  onPageSizeChange={handlePageSizeChange}
                />
              </>
            )}
          </div>
        </div>
      </main>

      {selectedEmployeeDetails && (
        <div
          className="employee-detail-overlay"
          onClick={handleCloseEmployeeDetails}
        >
          <section
            className="employee-detail-panel"
            onClick={handleEmployeeDetailPanelClick}
          >
            <div className="employee-detail-header">
              <div>
                <p className="page-eyebrow">Employee Details</p>
                <h2>{selectedEmployeeDetails.name}</h2>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCloseEmployeeDetails}
              >
                <i className="fas fa-xmark" />
                Close
              </button>
            </div>

            <div className="employee-detail-grid">
              <div className="detail-box">
                <span>Employee ID</span>
                <strong>{selectedEmployeeDetails.id}</strong>
              </div>

              <div className="detail-box">
                <span>Email</span>
                <strong
                  className="email-text"
                  title={selectedEmployeeDetails.email || "N/A"}
                >
                  {selectedEmployeeDetails.email || "N/A"}
                </strong>
              </div>

              <div className="detail-box">
                <span>Assigned Assets</span>
                <strong>{selectedEmployeeDetails.assignedCount}</strong>
              </div>

              <div className="detail-box">
                <span>Tickets Raised</span>
                <strong>{selectedEmployeeDetails.raisedTickets.length}</strong>
              </div>
            </div>

            <div className="employee-detail-section">
              <h3>Asset Assigned</h3>

              {selectedEmployeeDetails.activeAssignments.length === 0 ? (
                <div className="empty-state compact">
                  <i className="fas fa-box-open" />
                  <p>No active assets assigned.</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Asset ID</th>
                        <th>Asset Name</th>
                        <th>Issued Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedEmployeeDetails.activeAssignments.map(
                        (assignment) => (
                          <tr key={assignment.assignmentId || assignment.id}>
                            <td className="td-mono">{assignment.assetId}</td>
                            <td>
                              {getAssignmentAssetName(assignment, assets)}
                            </td>
                            <td className="td-mono">
                              {formatDate(assignment.issuedDate)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="employee-detail-section">
              <h3>Tickets Raised</h3>

              {selectedEmployeeDetails.raisedTickets.length === 0 ? (
                <div className="empty-state compact">
                  <i className="fas fa-inbox" />
                  <p>No tickets raised.</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Ticket #</th>
                        <th>Asset</th>
                        <th>Issue</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedEmployeeDetails.raisedTickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td className="td-mono">#{ticket.id}</td>
                          <td>{ticket.assetName || (ticket.assetId ? `Asset #${ticket.assetId}` : "—")}</td>
                          <td>{ticket.issueDescription}</td>
                          <td>
                            <span
                              className={`badge ${getTicketStatusBadgeClass(
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
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
