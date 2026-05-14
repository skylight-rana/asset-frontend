import API from "./api";

export const getTickets = () => API.get("/ticket");

export const createTicket = (data) =>
  API.post("/ticket", data);

// NEW
export const getTicketById = (id) =>
  API.get(`/ticket/${id}`);

export const updateTicket = (id, data) =>
  API.put(`/ticket/${id}`, data);

export const updateTicketStatus = async (data) => {

  return await axios.put(
    `${API}/ticket`,
    {
      ticketId: data.ticketId,
      status: data.status,
      resolutionNotes: data.resolutionNotes
    }
  );

};