import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  DetailsModal,
  NotificationDialog,
  Pagination,
  Sidebar,
} from "../../components";
import {
  DEFAULT_PAGE_SIZE,
  ROUTES,
  TICKET_STATUS_OPTIONS,
} from "../../constants";
import {
  getAssets,
  getAssignments,
  getTickets,
  updateTicket,
} from "../../services";
import {
  belongsToEmployee,
  formatDate,
  getApiErrorMessage,
  getPrimaryEmployeeId,
  getTicketStatusBadgeClass,
  getUser,
  isReturned,
} from "../../utils";

import "./EmployeeDashboard.css";

function EmployeeDashboard() {
  // =========================
  // State
  // =========================
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const [loading, setLoading] = useState(false);
  const [updatingTicketId, setUpdatingTicketId] = useState(null);
  const [notification, setNotification] = useState(null);

  const [assetPage, setAssetPage] = useState(1);
  const [ticketPage, setTicketPage] = useState(1);
  const [assignedTicketPage, setAssignedTicketPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // =========================
  // Initial Load
  // =========================
  useEffect(() => {
    const storedUser = getUser();

    setUser(storedUser);
    loadDashboardData(storedUser);
  }, []);

  // =========================
  // Derived Data
  // =========================
  const myAssignments = useMemo(() => {
    return assignments.filter(
      (assignment) =>
        belongsToEmployee(assignment, user) && !isReturned(assignment)
    );
  }, [assignments, user]);

  const myTickets = useMemo(() => {
    return tickets.filter((ticket) => belongsToEmployee(ticket, user));
  }, [tickets, user]);

  const ticketsAssignedToMe = useMemo(() => {
    const employeeId = getPrimaryEmployeeId(user);

    return tickets.filter(
      (ticket) =>
        String(ticket.assignedToEmployeeId || "") === String(employeeId || "")
    );
  }, [tickets, user]);

  // =========================
  // Pagination
  // =========================
  const assetTotalPages = Math.max(
    1,
    Math.ceil(myAssignments.length / pageSize)
  );

  const ticketTotalPages = Math.max(1, Math.ceil(myTickets.length / pageSize));

  const assignedTicketTotalPages = Math.max(
    1,
    Math.ceil(ticketsAssignedToMe.length / pageSize)
  );

  const currentAssetPage = Math.min(assetPage, assetTotalPages);
  const currentTicketPage = Math.min(ticketPage, ticketTotalPages);
  const currentAssignedTicketPage = Math.min(
    assignedTicketPage,
    assignedTicketTotalPages
  );

  const paginatedAssignments = myAssignments.slice(
    (currentAssetPage - 1) * pageSize,
    currentAssetPage * pageSize
  );

  const paginatedTickets = myTickets.slice(
    (currentTicketPage - 1) * pageSize,
    currentTicketPage * pageSize
  );

  const paginatedAssignedTickets = ticketsAssignedToMe.slice(
    (currentAssignedTicketPage - 1) * pageSize,
    currentAssignedTicketPage * pageSize
  );

  // =========================
  // API Functions
  // =========================
  const loadDashboardData = async (storedUser) => {
    try {
      setLoading(true);

      const [assignmentRes, ticketRes, assetRes] = await Promise.all([
        getAssignments(),
        getTickets(),
        getAssets(),
      ]);

      setAssignments(assignmentRes.data || []);
      setTickets(ticketRes.data || []);
      setAssets(assetRes.data || []);
    } catch (error) {
      console.error("Failed to load employee dashboard", error, storedUser);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Asset Helpers
  // =========================
  function getAssetById(assetId) {
    return assets.find((asset) => String(asset.id) === String(assetId));
  }

  function showAssetDetails(assetId) {
    const asset = getAssetById(assetId);

    if (asset) {
      setSelectedAsset(asset);
    }
  }

  function getAssetName(ticket) {
    return (
      ticket.assetName ||
      getAssetById(ticket.assetId)?.name ||
      `Asset #${ticket.assetId}`
    );
  }

  // =========================
  // Person Helpers
  // =========================
  const getRaisedByPerson = (ticket) => ({
    title: "Raised By",
    id: ticket.employeeId,
    name: ticket.employeeName || `Employee #${ticket.employeeId}`,
    email: ticket.employeeEmail || "",
    profilePhoto: ticket.employeeProfilePhoto || "",
    role: "Employee",
  });

  const getAssignedByPerson = (ticket) => ({
    title: "Assigned By",
    id: ticket.assignedByUserId,
    name: ticket.assignedByUserName || "Admin",
    email: ticket.assignedByUserEmail || "",
    profilePhoto: ticket.assignedByUserProfilePhoto || "",
    role: "Admin",
  });

  const showPersonDetails = (person) => {
    setSelectedPerson(person);
  };

  // =========================
  // Ticket Helpers
  // =========================
  const updateLocalTicket = (ticketId, changes) => {
    setTickets((previousTickets) =>
      previousTickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, ...changes } : ticket
      )
    );
  };

  // =========================
  // Event Handlers
  // =========================
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setAssetPage(1);
    setTicketPage(1);
    setAssignedTicketPage(1);
  };

  const handleAssignedTicketStatusChange = async (ticket, status) => {
    if (!status || status === ticket.status) return;

    try {
      setUpdatingTicketId(ticket.id);

      await updateTicket(ticket.id, {
        status,
        resolutionNotes: ticket.resolutionNotes || "",
        assignedToEmployeeId: ticket.assignedToEmployeeId,
        assignedByUserId: ticket.assignedByUserId,
      });

      updateLocalTicket(ticket.id, { status });

      setNotification({
        type: "success",
        title: "Ticket status updated",
        message: `Ticket #${ticket.id} status changed to ${status}.`,
      });
    } catch (error) {
      setNotification({
        type: "error",
        title: "Status update failed",
        message: getApiErrorMessage(
          error,
          "Ticket status could not be updated."
        ),
      });
    } finally {
      setUpdatingTicketId(null);
    }
  };

  // =========================
  // Render
  // =========================
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
              <h1>
                {user ? `Welcome, ${user.username}` : "Employee Dashboard"}
              </h1>
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
                <h4>Assigned Tickets</h4>
                <p>
                  {ticketsAssignedToMe.length} tickets assigned to you by admin.
                </p>
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
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedAssignments.map((assignment) => (
                        <tr key={assignment.assignmentId || assignment.id}>
                          <td
                            className="asset-name clickable-text"
                            onClick={() => showAssetDetails(assignment.assetId)}
                          >
                            {assignment.assetName ||
                              `Asset #${assignment.assetId}`}
                          </td>

                          <td className="td-mono">{assignment.assetId}</td>

                          <td className="td-mono">
                            {formatDate(assignment.issuedDate)}
                          </td>

                          <td>
                            <span className="badge badge-warn">Active</span>
                          </td>

                          <td>
                            <Link
                              className="btn btn-primary btn-sm"
                              to={`${ROUTES.EMPLOYEE_TICKETS}?assetId=${assignment.assetId}`}
                            >
                              <i className="fas fa-ticket" /> Raise Ticket
                            </Link>
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
              <i className="fas fa-user-check text-muted" />
              <span>Tickets Assigned To Me</span>
            </div>

            {loading ? (
              <div className="empty-state">
                <i className="fas fa-spinner fa-spin" />
                <p>Loading...</p>
              </div>
            ) : ticketsAssignedToMe.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-clipboard-check" />
                <p>No tickets assigned to you yet.</p>
              </div>
            ) : (
              <>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Ticket #</th>
                        <th>Raised By</th>
                        <th>Assigned By Admin</th>
                        <th>Asset</th>
                        <th>Issue</th>
                        <th>Status</th>
                        <th>Created</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedAssignedTickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td className="td-mono">#{ticket.id}</td>

                          <td>
                            <button
                              type="button"
                              className="link-button"
                              onClick={() =>
                                showPersonDetails(getRaisedByPerson(ticket))
                              }
                            >
                              {ticket.employeeName ||
                                `Employee #${ticket.employeeId}`}
                            </button>
                          </td>

                          <td>
                            {ticket.assignedByUserId ||
                            ticket.assignedByUserName ? (
                              <button
                                type="button"
                                className="link-button"
                                onClick={() =>
                                  showPersonDetails(getAssignedByPerson(ticket))
                                }
                              >
                                {ticket.assignedByUserName || "Admin"}
                              </button>
                            ) : (
                              <span className="text-muted">Not available</span>
                            )}
                          </td>

                          <td
                            className="clickable-text"
                            onClick={() => showAssetDetails(ticket.assetId)}
                          >
                            {getAssetName(ticket)}
                          </td>

                          <td>{ticket.issueDescription}</td>

                          <td>
                            <select
                              className="status-pill-select"
                              value={ticket.status || "Open"}
                              disabled={updatingTicketId === ticket.id}
                              onChange={(event) =>
                                handleAssignedTicketStatusChange(
                                  ticket,
                                  event.target.value
                                )
                              }
                            >
                              {TICKET_STATUS_OPTIONS.map((status) => (
                                <option key={status.value} value={status.value}>
                                  {status.label}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="td-mono">
                            {formatDate(ticket.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  page={currentAssignedTicketPage}
                  pageSize={pageSize}
                  totalItems={ticketsAssignedToMe.length}
                  onPageChange={setAssignedTicketPage}
                  onPageSizeChange={handlePageSizeChange}
                />
              </>
            )}
          </div>

          <div className="card dashboard-section-card">
            <div className="section-title">
              <i className="fas fa-ticket text-muted" />
              <span>My Raised Tickets</span>

              <Link
                className="btn btn-secondary btn-sm"
                to={ROUTES.EMPLOYEE_TICKETS}
              >
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
                        <th>Asset</th>
                        <th>Issue</th>
                        <th>Status</th>
                        <th>Assigned To</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedTickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td className="td-mono">#{ticket.id}</td>

                          <td
                            className="clickable-text"
                            onClick={() => showAssetDetails(ticket.assetId)}
                          >
                            {getAssetName(ticket)}
                          </td>

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

                          <td>
                            {ticket.assignedToEmployeeName ||
                              (ticket.assignedToEmployeeId
                                ? `Employee #${ticket.assignedToEmployeeId}`
                                : "Unassigned")}
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

      <DetailsModal
        title="Asset Details"
        open={Boolean(selectedAsset)}
        onClose={() => setSelectedAsset(null)}
      >
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Asset ID</span>
            <span className="detail-value">#{selectedAsset?.id}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Name</span>
            <span className="detail-value">{selectedAsset?.name}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Type</span>
            <span className="detail-value">{selectedAsset?.type}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Serial Number</span>
            <span className="detail-value">{selectedAsset?.serialNumber}</span>
          </div>
        </div>
      </DetailsModal>

      <DetailsModal
        title={selectedPerson?.title || "User Details"}
        open={Boolean(selectedPerson)}
        onClose={() => setSelectedPerson(null)}
      >
        <div className="profile-detail-card">
          {selectedPerson?.profilePhoto ? (
            <img
              src={selectedPerson.profilePhoto}
              alt={selectedPerson.name}
              className="profile-detail-photo"
            />
          ) : (
            <div className="profile-detail-photo placeholder">
              <i className="fas fa-user" />
            </div>
          )}

          <div>
            <h3>{selectedPerson?.name || "N/A"}</h3>
            <p>{selectedPerson?.role || "User"}</p>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">ID</span>
            <span className="detail-value">
              {selectedPerson?.id ? `#${selectedPerson.id}` : "N/A"}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Email</span>
            <span className="detail-value">{selectedPerson?.email || "N/A"}</span>
          </div>
        </div>
      </DetailsModal>

      <NotificationDialog
        open={Boolean(notification)}
        type={notification?.type}
        title={notification?.title}
        message={notification?.message}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}

export default EmployeeDashboard;
