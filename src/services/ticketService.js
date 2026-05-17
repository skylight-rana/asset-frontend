import API from "./api";

export const getTickets = () => API.get("/ticket");

export const createTicket = (data) => API.post("/ticket", data);

export const getTicketById = (id) => API.get(`/ticket/${id}`);

export const updateTicket = (id, data) => API.put(`/ticket/${id}`, data);

export const updateTicketStatus = (data) =>
  API.put("/ticket", {
    ticketId: data.ticketId,
    status: data.status,
    resolutionNotes: data.resolutionNotes,
  });