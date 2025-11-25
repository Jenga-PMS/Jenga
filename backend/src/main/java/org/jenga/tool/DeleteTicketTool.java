package org.jenga.tool;

import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import org.jenga.dto.TicketResponseDTO;
import org.jenga.service.TicketService;
import org.jenga.service.MCP_Server.ChatRequestContext;

@ApplicationScoped
public class DeleteTicketTool {

    @Inject
    TicketService ticketService;    
    @Inject
    ChatRequestContext requestContext;

    @Tool("Deletes a specific ticket. If no ticketId is provided, it attempts to delete the user's current ticket.")
    public String deleteTicket(            
            @P("The internal database ID (e.g., 101, 102) of the ticket to delete. If null, the user's current ticket context will be used.")
            Long ticketId
    ) {
        
        try {
            Long finalTicketId = ticketId;

            if (finalTicketId == null) {
                finalTicketId = requestContext.getCurrentTicketID();
            }

            if (finalTicketId == null) {
                return "ERROR: Could not delete ticket. Reason: No ticket ID was provided, and there is no current ticket in context.";
            }

            TicketResponseDTO ticket = ticketService.findById(finalTicketId);

            ticketService.delete(ticket.getId());
            
            return "SUCCESS: Successfully deleted ticket " + ticket.getTicketNumber() + ".";

        } catch (NotFoundException e) {
            return "ERROR: Could not delete ticket. Reason: No ticket found with ID: " + (ticketId != null ? ticketId : requestContext.getCurrentTicketID());
        } catch (Exception e) {
            return "ERROR: An unexpected error occurred while deleting the ticket: " + e.getMessage();
        }
    }
}