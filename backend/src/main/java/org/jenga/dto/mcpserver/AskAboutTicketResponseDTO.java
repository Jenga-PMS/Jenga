package org.jenga.dto.mcpserver;
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
