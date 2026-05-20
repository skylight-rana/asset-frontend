import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Pagination, Sidebar } from "../../components";
import { DEFAULT_PAGE_SIZE, ROUTES } from "../../constants";
import { getAssignments, getTickets } from "../../services";
import {
  belongsToEmployee,
  formatDate,
  getTicketStatusBadgeClass,
  getUser,
  isReturned,
} from "../../utils";

import "./EmployeeDashboard.css";

function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ticketPage, setTicketPage] = useState(1);
  const [assetPage, setAssetPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    const storedUser = getUser();

    setUser(storedUser);
    loadDashboardData(storedUser);
  }, []);

  const myAssignments = useMemo(() => {
    return assignments.filter(
      (assignment) => belongsToEmployee(assignment, user) && !isReturned(assignment)
    );
  }, [assignments, user]);

  const myTickets = useMemo(() => {
    return tickets.filter((ticket) => belongsToEmployee(ticket, user));
  }, [tickets, user]);

  const assetTotalPages = Math.max(1, Math.ceil(myAssignments.length / pageSize));
  const ticketTotalPages = Math.max(1, Math.ceil(myTickets.length / pageSize));
  const currentAssetPage = Math.min(assetPage, assetTotalPages);
  const currentTicketPage = Math.min(ticketPage, ticketTotalPages);

  const paginatedAssignments = myAssignments.slice(
    (currentAssetPage - 1) * pageSize,
    currentAssetPage * pageSize
  );

  const paginatedTickets = myTickets.slice(
    (currentTicketPage - 1) * pageSize,
    currentTicketPage * pageSize
  );

  const loadDashboardData = async (storedUser) => {
    try {
      setLoading(true);

      const [assignmentRes, ticketRes] = await Promise.all([
        getAssignments(),
        getTickets(),
      ]);

      setAssignments(assignmentRes.data || []);
      setTickets(ticketRes.data || []);
    } catch (error) {
      console.error("Failed to load employee dashboard", error, storedUser);
    } finally {
      setLoading(false);
    }
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setAssetPage(1);
    setTicketPage(1);
  };

  return (
    <div className="app-layout">
      <Sidebar role="Employee" />

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
        </header>

        <div className="content">
          <div className="page-header">
            <div>
              <p className="page-eyebrow">Employee Portal</p>
              <h1>{user ? `Welcome, ${user.username}` : "Employee Dashboard"}</h1>
            </div>
          </div>

          <div className="grid-2 dashboard-card-grid compact-dashboard-grid">
            <div className="card quick-link">
              <i className="fas fa-box" />
              <div>
                <h4>Assigned Assets</h4>
                <p>{myAssignments.length} active assets assigned to you.</p>
              </div>
            </div>

            <div className="card quick-link">
              <i className="fas fa-ticket" />
              <div>
                <h4>Raised Tickets</h4>
                <p>{myTickets.length} tickets raised by you.</p>
              </div>
            </div>
          </div>

          <div className="card dashboard-section-card">
            <div className="section-title">
              <i className="fas fa-box text-muted" />
              <span>My Assigned Assets</span>
            </div>

            {loading ? (
              <div className="empty-state">
                <i className="fas fa-spinner fa-spin" />
                <p>Loading...</p>
              </div>
            ) : myAssignments.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-box-open" />
                <p>No active assets assigned.</p>
              </div>
            ) : (
              <>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Asset</th>
                        <th>Asset ID</th>
                        <th>Issued Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedAssignments.map((assignment) => (
                        <tr key={assignment.assignmentId || assignment.id}>
                          <td className="asset-name">
                            {assignment.assetName || `Asset #${assignment.assetId}`}
                          </td>
                          <td className="td-mono">{assignment.assetId}</td>
                          <td className="td-mono">
                            {formatDate(assignment.issuedDate)}
                          </td>
                          <td>
                            <span className="badge badge-warn">Active</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  page={currentAssetPage}
                  pageSize={pageSize}
                  totalItems={myAssignments.length}
                  onPageChange={setAssetPage}
                  onPageSizeChange={handlePageSizeChange}
                />
              </>
            )}
          </div>

          <div className="card dashboard-section-card">
            <div className="section-title">
              <i className="fas fa-ticket text-muted" />
              <span>My Raised Tickets</span>
              <Link className="btn btn-secondary btn-sm" to={ROUTES.EMPLOYEE_TICKETS}>
                Raise Ticket
              </Link>
            </div>

            {loading ? (
              <div className="empty-state">
                <i className="fas fa-spinner fa-spin" />
                <p>Loading...</p>
              </div>
            ) : myTickets.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-inbox" />
                <p>No tickets raised yet.</p>
              </div>
            ) : (
              <>
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
                      {paginatedTickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td className="td-mono">#{ticket.id}</td>
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

                <Pagination
                  page={currentTicketPage}
                  pageSize={pageSize}
                  totalItems={myTickets.length}
                  onPageChange={setTicketPage}
                  onPageSizeChange={handlePageSizeChange}
                />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default EmployeeDashboard;
