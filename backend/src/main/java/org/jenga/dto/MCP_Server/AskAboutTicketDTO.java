package org.jenga.dto.MCP_Server;

import lombok.Data;

@Data
public class AskAboutTicketDTO {
    private String message;
    private String ticketId;
}
