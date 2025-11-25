package org.jenga.dto.MCP_Server;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor 
@AllArgsConstructor 
public class AskAboutTicketResponseDTO {
    private String message;
    private String ticketId;
}
