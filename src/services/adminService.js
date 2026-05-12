import axios from "axios";

const API = "https://localhost:7117/api";

// ADMIN: UPDATE TICKET STATUS
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