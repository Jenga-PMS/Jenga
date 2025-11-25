package org.jenga.dto;

import lombok.Data;

@Data
public class AcceptanceCriteriaResponseDTO {
    private Long id;
    private String description;
    private boolean completed;
}
