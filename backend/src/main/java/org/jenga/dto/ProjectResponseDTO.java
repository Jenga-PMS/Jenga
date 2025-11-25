package org.jenga.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class ProjectResponseDTO {
    private String identifier;
    private String name;
    private String description;
    private LocalDateTime createDate;
    private LocalDateTime modifyDate;
}
