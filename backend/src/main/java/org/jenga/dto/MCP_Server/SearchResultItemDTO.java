package org.jenga.dto.MCP_Server;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true) 
public class SearchResultItemDTO {
    private String title;
    private String link;
    private String snippet;
}