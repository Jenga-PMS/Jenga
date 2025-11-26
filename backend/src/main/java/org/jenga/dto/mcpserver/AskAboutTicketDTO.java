package org.jenga.dto.mcpserver;

import lombok.Data;

@Data
public class AskAboutTicketDTO {
    private String message;
    private String ticketId;
}
