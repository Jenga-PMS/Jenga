package org.jenga.tool;

import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import org.jenga.dto.TicketRequestDTO;
import org.jenga.dto.TicketResponseDTO;
import org.jenga.model.TicketPriority;
import org.jenga.model.TicketSize;
import org.jenga.model.TicketStatus;
import org.jenga.service.TicketService;
import org.jenga.service.MCP_Server.ChatRequestContext;
import java.util.List;

@ApplicationScoped
public class EditTicketTool {

    @Inject
    TicketService ticketService;

    @Inject
    ChatRequestContext requestContext;

    @Tool("Updates an existing ticket. Only fields that are provided (not null) will be changed.")
    public String editTicket(
            @P("The internal database ID (e.g., 101, 102) of the ticket to edit. If null, the user's current ticket context is used.")
            Long ticketId,
            
            @P("The new title for the ticket. If null, the title will not be changed.")
            String title,
            
            @P("The new detailed description for the ticket. If null, the description will not be changed.")
            String description,
            
            @P("The username of the new assignee. Use 'unassigned' to unassign. If null, the assignee will not be changed.")
            String assignee,
            
            @P("The new priority. If null, the priority will not be changed.")
            TicketPriority priority,
            
            @P("The new size. If null, the size will not be changed.")
            TicketSize size,
            
            @P("The new status. If null, the status will not be changed.")
            TicketStatus status,
            
            @P("A new list of label names. This will REPLACE the old list. If null, labels will not be changed.")
            List<String> labels
    ) {
        
        try {
            Long finalTicketId = ticketId;
            if (finalTicketId == null) {
                finalTicketId = requestContext.getCurrentTicketID();
            }

            if (finalTicketId == null) {
                return "ERROR: Could not edit ticket. Reason: No ticket ID was provided, and there is no current ticket in context.";
            }

            TicketResponseDTO existingTicket;
            try {
                existingTicket = ticketService.findById(finalTicketId);
            } catch (NotFoundException e) {
                return "ERROR: Cannot edit ticket. Ticket " + finalTicketId + " not found.";
            }

            TicketRequestDTO updateDTO = new TicketRequestDTO();
            updateDTO.setTitle(existingTicket.getTitle());
            updateDTO.setDescription(existingTicket.getDescription());
            updateDTO.setAssignee(existingTicket.getAssignee() != null ? existingTicket.getAssignee() : null);
            updateDTO.setPriority(existingTicket.getPriority());
            updateDTO.setSize(existingTicket.getSize());
            updateDTO.setStatus(existingTicket.getStatus());
            updateDTO.setLabels(existingTicket.getLabels());

            if (title != null) {
                updateDTO.setTitle(title);
            }
            if (description != null) {
                updateDTO.setDescription(description);
            }
            if (priority != null) {
                updateDTO.setPriority(priority);
            }
            if (size != null) {
                updateDTO.setSize(size);
            }
            if (status != null) {
                updateDTO.setStatus(status);
            }
            if (labels != null) {
                updateDTO.setLabels(labels); 
            }
            
            if (assignee != null) {
                if (assignee.equalsIgnoreCase("unassigned") || assignee.isBlank()) {
                    updateDTO.setAssignee(null);
                } else {
                    updateDTO.setAssignee(assignee);
                }
            }

            TicketResponseDTO updatedTicket = ticketService.update(existingTicket.getId(), updateDTO);
            
            return "SUCCESS: Ticket " + updatedTicket.getTicketNumber() + " has been updated.";

        } catch (NotFoundException | BadRequestException e) {
            return "ERROR: Could not update ticket. Reason: " + e.getMessage();
        } catch (Exception e) {
            return "ERROR: An unexpected error occurred: " + e.getMessage();
        }
    }
}