package org.jenga.tool;

import dev.langchain4j.agent.tool.Tool;
import dev.langchain4j.agent.tool.P;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import org.jenga.dto.TicketResponseDTO;
import org.jenga.dto.MCP_Server.AskAboutTicketResponseDTO;
import org.jenga.service.TicketService;
import org.jenga.service.MCP_Server.ChatRequestContext;

@ApplicationScoped 
public class AskAboutTicketTool {

    @Inject
    TicketService ticketService; 

    @Inject
    ChatRequestContext requestContext;

    @Tool("Get information about a specific ticket. If no ticketId is provided, it uses the user's current ticket context.")
    public AskAboutTicketResponseDTO getTicketInfo(
            @P("The internal database ID (e.g., 101, 102) of the ticket. If null, the user's current ticket is used.") 
            Long ticketId) {

        try {
            Long finalTicketId = ticketId;
            if (finalTicketId == null) {
                finalTicketId = requestContext.getCurrentTicketID();
            }

            if (finalTicketId == null) {
                return new AskAboutTicketResponseDTO(
                    "ERROR: No ticket ID was provided, and there is no current ticket in context.",
                    null
                );
            }

            TicketResponseDTO ticket = ticketService.findById(finalTicketId);

            String assigneeName = ticket.getAssignee() != null ? ticket.getAssignee() : "Unassigned";

            String message = String.format(
                "Ticket %s-%d: '%s' (%s). Assigned to: %s. Description: %s",
                ticket.getProjectName(),
                ticket.getTicketNumber(),
                ticket.getTitle(),
                ticket.getStatus(),
                assigneeName,
                ticket.getDescription()
            );

            return new AskAboutTicketResponseDTO(message, ticket.getId().toString());

        } catch (NotFoundException e) {
            String errorId = (ticketId != null) ? ticketId.toString() : (requestContext.getCurrentTicketID() != null ? requestContext.getCurrentTicketID().toString() : "N/A");
            return new AskAboutTicketResponseDTO(
                "ERROR: Sorry, I couldn't find a ticket with ID: " + errorId,
                errorId
            );
        } catch (Exception e) {
            return new AskAboutTicketResponseDTO(
                "ERROR: An unexpected error occurred: " + e.getMessage(),
                null
            );
        }
    }
}