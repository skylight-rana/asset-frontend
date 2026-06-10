export function getPossibleEmployeeIds(user) {
  return [user?.employeeId, user?.EmployeeId, user?.id, user?.userId]
    .filter((value) => value !== undefined && value !== null && value !== "")
    .map(String);
}

export function getPrimaryEmployeeId(user) {
  return user?.employeeId || user?.EmployeeId || user?.id || user?.userId;
}

export function belongsToEmployee(item, user) {
  const possibleEmployeeIds = getPossibleEmployeeIds(user);
  const username = user?.username?.toLowerCase();

  return (
    possibleEmployeeIds.includes(String(item?.employeeId || item?.EmployeeId || "")) ||
    item?.employeeName?.toLowerCase() === username ||
    item?.createdBy?.toLowerCase() === username ||
    item?.username?.toLowerCase() === username
  );
}

export function getTicketEmployeeName(ticket, employees = []) {
  if (ticket?.employeeName) return ticket.employeeName;
  if (ticket?.username) return ticket.username;

  return getEmployeeDisplayName(ticket?.employeeId, employees);
}

export function getEmployeeDisplayName(employeeId, employees = []) {
  const employee = employees.find(
    (item) =>
      String(item.id) === String(employeeId) ||
      String(item.userId) === String(employeeId)
  );

  return employee?.name || employee?.username || `Employee ID: ${employeeId}`;
}