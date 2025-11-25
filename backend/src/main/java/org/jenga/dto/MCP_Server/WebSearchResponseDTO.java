package org.jenga.dto.MCP_Server;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WebSearchResponseDTO {
    private List<SearchResultItemDTO> items;
}
