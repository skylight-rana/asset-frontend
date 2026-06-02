import { ROUTES } from "./routes";

export const NAVIGATION_CONFIG = {
  Admin: [
    {
      section: "Overview",
      items: [{ to: ROUTES.ADMIN_DASHBOARD, end: true, icon: "fa-house", label: "Dashboard" }],
    },
    {
      section: "Asset Management",
      items: [
        { to: ROUTES.ADMIN_ASSETS, icon: "fa-box", label: "Assets" },
        { to: ROUTES.ADMIN_ASSIGNMENTS, icon: "fa-link", label: "Assignments" },
        { to: ROUTES.ADMIN_DOCUMENTS, icon: "fa-file", label: "Documents" },
      ],
    },
    {
      section: "Users",
      items: [{ to: ROUTES.ADMIN_USERS, icon: "fa-users", label: "Users" }],
    },
    {
      section: "Support",
      items: [{ to: ROUTES.ADMIN_TICKETS, icon: "fa-ticket", label: "Tickets" }],
    },
  ],
  Employee: [
    {
      section: "My Workspace",
      items: [{ to: ROUTES.EMPLOYEE_DASHBOARD, end: true, icon: "fa-house", label: "Dashboard" }],
    },
    {
      section: "Support",
      items: [{ to: ROUTES.EMPLOYEE_TICKETS, icon: "fa-ticket", label: "Raise / Track Tickets" }],
    },
  ],
};
