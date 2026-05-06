import axios from "axios";

const API = "https://localhost:7117/api";

//Admin: Update Ticket Status
export const updateTicketStatus = async (data) => {
    return await axios.put(`${API}/ticket/update-status`, {
        ticketId: data.ticketId,
        status: data.status,
        resolutionNotes: data.resolutionNotes
    });
};