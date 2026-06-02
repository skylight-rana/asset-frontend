import { useEffect, useMemo, useState } from "react";

import { DetailsModal, NotificationDialog, Pagination, PageHeader } from "../../components";
import { DEFAULT_PAGE_SIZE, TICKET_STATUS_OPTIONS } from "../../constants";
import { DashboardLayout } from "../../layouts";
import { getAssets, getEmployees, getTickets, updateTicket } from "../../services";
import { getApiErrorMessage, getTicketEmployeeName, getTicketStatusBadgeClass, getUser } from "../../utils";

import "./UpdateTicket.css";

function UpdateTicket() {
  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingTicketId, setUpdatingTicketId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [notification, setNotification] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => { setCurrentUser(getUser()); loadTickets(); }, []);

  const totalPages = Math.max(1, Math.ceil(tickets.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedTickets = useMemo(() => tickets.slice((currentPage - 1) * pageSize, currentPage * pageSize), [tickets, currentPage, pageSize]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const [ticketRes, employeeRes, assetRes] = await Promise.all([getTickets(), getEmployees(), getAssets()]);
      setTickets(ticketRes.data || []);
      setEmployees(employeeRes.data || []);
      setAssets(assetRes.data || []);
    } catch (error) {
      setNotification({ type: "error", title: "Tickets not loaded", message: getApiErrorMessage(error, "Failed to load tickets.") });
    } finally {
      setLoading(false);
    }
  };

  const saveTicketUpdate = async (ticket, changes, successMessage) => {
    try {
      setUpdatingTicketId(ticket.id);
      const payload = {
        status: changes.status ?? ticket.status,
        resolutionNotes: changes.resolutionNotes ?? ticket.resolutionNotes ?? "",
        assignedToEmployeeId: changes.assignedToEmployeeId ?? ticket.assignedToEmployeeId ?? null,
        assignedByUserId: changes.assignedByUserId ?? ticket.assignedByUserId ?? null,
      };

      await updateTicket(ticket.id, payload);

      setTickets((previousTickets) =>
        previousTickets.map((item) =>
          item.id === ticket.id ? { ...item, ...payload } : item
        )
      );

      setNotification({
        type: "success",
        title: "Ticket updated",
        message: successMessage || `Ticket #${ticket.id} updated successfully.`,
      });
    } catch (error) {
      setNotification({
        type: "error",
        title: "Update failed",
        message: getApiErrorMessage(error, "Ticket could not be updated."),
      });
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const handleStatusChange = async (ticket, status) => {
    if (!status || status === ticket.status) return;
    saveTicketUpdate(ticket, { status }, `Ticket #${ticket.id} status changed to ${status}.`);
  };

  const handleAssigneeChange = async (ticket, assignedToEmployeeId) => {
    const nextAssignedToEmployeeId = assignedToEmployeeId ? Number(assignedToEmployeeId) : null;
    if (String(nextAssignedToEmployeeId || "") === String(ticket.assignedToEmployeeId || "")) return;

    const assignedEmployee = employees.find((employee) => String(employee.id) === String(nextAssignedToEmployeeId));

    try {
      setUpdatingTicketId(ticket.id);
      const payload = {
        status: ticket.status,
        resolutionNotes: ticket.resolutionNotes || "",
        assignedToEmployeeId: nextAssignedToEmployeeId,
        assignedByUserId: currentUser?.userId || currentUser?.UserId || ticket.assignedByUserId || null,
      };

      await updateTicket(ticket.id, payload);

      setTickets((previousTickets) =>
        previousTickets.map((item) =>
          item.id === ticket.id
            ? {
                ...item,
                ...payload,
                assignedToEmployeeName: assignedEmployee?.name || "",
                assignedToEmployeeEmail: assignedEmployee?.email || "",
                assignedByUserId: currentUser?.userId || currentUser?.UserId || ticket.assignedByUserId || null,
                assignedByUserName: currentUser?.name || currentUser?.Name || currentUser?.username || currentUser?.Username || "Admin",
                assignedByUserEmail: currentUser?.email || currentUser?.Email || "",
                assignedByUserProfilePhoto: currentUser?.profilePhoto || currentUser?.ProfilePhoto || "",
              }
            : item
        )
      );

      setNotification({
        type: "success",
        title: "Ticket assigned",
        message: assignedEmployee
          ? `Ticket #${ticket.id} assigned to ${assignedEmployee.name}.`
          : `Assignee removed from ticket #${ticket.id}.`,
      });
    } catch (error) {
      setNotification({
        type: "error",
        title: "Assignment failed",
        message: getApiErrorMessage(error, "Ticket assignee could not be updated."),
      });
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const showAsset = (ticket, e) => {
    e.stopPropagation();
    setSelectedAsset(assets.find((asset) => String(asset.id) === String(ticket.assetId)) || { id: ticket.assetId, name: ticket.assetName });
  };

  const showEmployee = (ticket, e) => {
    e.stopPropagation();
    const employee = employees.find((item) => String(item.id) === String(ticket.employeeId));
    setSelectedEmployee({
      ...(employee || {}),
      id: ticket.employeeId,
      name: employee?.name || ticket.employeeName,
      email: employee?.email || ticket.employeeEmail,
      profilePhoto: employee?.profilePhoto || ticket.employeeProfilePhoto,
      role: "Employee",
    });
  };

  const showAssignedBy = (ticket, e) => {
    e.stopPropagation();
    setSelectedEmployee({
      id: ticket.assignedByUserId,
      name: ticket.assignedByUserName || "Admin",
      email: ticket.assignedByUserEmail || "",
      profilePhoto: ticket.assignedByUserProfilePhoto || "",
      role: "Admin",
    });
  };

  const handlePageSizeChange = (size) => { setPageSize(size); setPage(1); };

  return (
    <DashboardLayout role="Admin" title="Tickets">
      <PageHeader title="Ticket Management" />

      <div className="card" id="all-tickets">
        <div className="section-title"><i className="fas fa-ticket text-muted" /><span>All Tickets</span></div>
        {loading ? <div className="empty-state"><i className="fas fa-spinner fa-spin" /><p>Loading...</p></div> : tickets.length === 0 ? <div className="empty-state"><i className="fas fa-inbox" /><p>No tickets found.</p></div> : <>
          <div className="table-wrap"><table><thead><tr><th>ID</th><th>Raised By</th><th>Asset</th><th>Issue</th><th>Assigned To</th><th>Status</th><th>Update</th></tr></thead><tbody>{paginatedTickets.map((ticket) => <tr key={ticket.id}><td className="td-mono">#{ticket.id}</td><td className="clickable-text" onClick={(e) => showEmployee(ticket, e)}>{getTicketEmployeeName(ticket, employees)}</td><td className="clickable-text" onClick={(e) => showAsset(ticket, e)}>{ticket.assetName || `Asset #${ticket.assetId}`}</td><td>{ticket.issueDescription}</td><td><select className="status-pill-select" value={ticket.assignedToEmployeeId || ""} disabled={updatingTicketId === ticket.id} onChange={(e) => handleAssigneeChange(ticket, e.target.value)}><option value="">Unassigned</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} {employee.email ? `(${employee.email})` : ""}</option>)}</select></td><td><span className={`badge ${getTicketStatusBadgeClass(ticket.status)}`}>{ticket.status}</span></td><td><select className="status-pill-select" value={ticket.status || ""} disabled={updatingTicketId === ticket.id} onChange={(e) => handleStatusChange(ticket, e.target.value)}>{TICKET_STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></td></tr>)}</tbody></table></div>
          <Pagination page={currentPage} pageSize={pageSize} totalItems={tickets.length} onPageChange={setPage} onPageSizeChange={handlePageSizeChange} />
        </>}
      </div>

      <DetailsModal title="Asset Details" open={Boolean(selectedAsset)} onClose={() => setSelectedAsset(null)}><div className="detail-grid"><div className="detail-item"><span className="detail-label">Asset ID</span><span className="detail-value">#{selectedAsset?.id}</span></div><div className="detail-item"><span className="detail-label">Name</span><span className="detail-value">{selectedAsset?.name}</span></div><div className="detail-item"><span className="detail-label">Type</span><span className="detail-value">{selectedAsset?.type || "—"}</span></div><div className="detail-item"><span className="detail-label">Serial Number</span><span className="detail-value">{selectedAsset?.serialNumber || "—"}</span></div></div></DetailsModal>
      <DetailsModal title={selectedEmployee?.role === "Admin" ? "Admin Details" : "Employee Details"} open={Boolean(selectedEmployee)} onClose={() => setSelectedEmployee(null)}><div className="profile-detail-card">{selectedEmployee?.profilePhoto ? <img src={selectedEmployee.profilePhoto} alt={selectedEmployee.name} className="profile-detail-photo" /> : <div className="profile-detail-photo placeholder"><i className="fas fa-user" /></div>}<div><h3>{selectedEmployee?.name || "N/A"}</h3><p>{selectedEmployee?.role || "Employee"}</p></div></div><div className="detail-grid"><div className="detail-item"><span className="detail-label">ID</span><span className="detail-value">{selectedEmployee?.id ? `#${selectedEmployee.id}` : "N/A"}</span></div><div className="detail-item"><span className="detail-label">Email</span><span className="detail-value">{selectedEmployee?.email || "—"}</span></div></div></DetailsModal>
      <NotificationDialog open={Boolean(notification)} type={notification?.type} title={notification?.title} message={notification?.message} onClose={() => setNotification(null)} />
    </DashboardLayout>
  );
}

export default UpdateTicket;
