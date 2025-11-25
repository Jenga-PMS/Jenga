package org.jenga.dto.MCP_Server;

import lombok.Data;

@Data
public class ChatRequestDTO {
    private String message;
    private String conversationId;

    private String currentUser;
    private Long currentProjectID;
    private Long currentTicketID;
}
