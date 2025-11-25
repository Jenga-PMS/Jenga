package org.jenga.dto.MCP_Server;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponseDTO {
    private String response;
    private String conversationId;
}
