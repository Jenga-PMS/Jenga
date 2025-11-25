// src/main/java/org/jenga/rest/AiResource.java
package org.jenga.rest;

import jakarta.inject.Inject; 
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.UUID;

import org.jenga.dto.MCP_Server.ChatRequestDTO;
import org.jenga.dto.MCP_Server.ChatResponseDTO;
import org.jenga.service.MCP_Server.AiService;
import org.jenga.service.MCP_Server.ChatRequestContext;

@Path("/api/ai")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AiResource {

    @Inject
    AiService assistant; 

    @Inject
    ChatRequestContext requestContext;

    @POST
    @Path("/chat")
    public ChatResponseDTO chat(ChatRequestDTO request) {
        String conversationId = request.getConversationId();
        
        if (conversationId == null || conversationId.isBlank()) {
            conversationId = UUID.randomUUID().toString();
        }

        requestContext.setCurrentUser(request.getCurrentUser());
        requestContext.setCurrentProjectID(request.getCurrentProjectID());
        requestContext.setCurrentTicketID(request.getCurrentTicketID());

        try {
            String aiResponse = assistant.chat(conversationId, request.getMessage());
            return new ChatResponseDTO(aiResponse, conversationId);
            
        } catch (NullPointerException e) {
            String errorMsg = "I encountered an error processing that request. This is usually due to a tool execution issue. Please try rephrasing your request or try again.";
            return new ChatResponseDTO(errorMsg, conversationId);
        } catch (Exception e) {
            String errorMsg = "An unexpected error occurred: " + e.getMessage();
            return new ChatResponseDTO(errorMsg, conversationId);
        }
    }
}