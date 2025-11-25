package org.jenga.service.MCP_Server;

import jakarta.enterprise.context.RequestScoped;
import lombok.Data;

@RequestScoped
@Data
public class ChatRequestContext {
    private String currentUser;
    private Long currentProjectID;
    private Long currentTicketID;
}