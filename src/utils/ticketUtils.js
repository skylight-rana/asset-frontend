export function getTicketStatusBadgeClass(status) {
  switch (status) {
    case "Open":
      return "badge-warn";

    case "InProgress":
      return "badge-blue";

    default:
      return "badge-green";
  }
}
