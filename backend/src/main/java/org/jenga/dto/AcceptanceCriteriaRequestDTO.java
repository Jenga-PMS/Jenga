package org.jenga.dto;

import lombok.Data;

@Data
public class AcceptanceCriteriaRequestDTO {
    private String description;
    private boolean completed;
}
