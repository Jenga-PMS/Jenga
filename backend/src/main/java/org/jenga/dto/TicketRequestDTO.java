package org.jenga.dto;

import java.util.List;

import org.jenga.model.TicketPriority;
import org.jenga.model.TicketSize;
import org.jenga.model.TicketStatus;
import lombok.Data;

@Data
public class TicketRequestDTO {
    private String title;
    private String description;
    private TicketPriority priority;
    private TicketSize size;
    private TicketStatus status;
    private String projectName;
    private String assignee;
    private String reporter;
    private List<String> labels;
    private List<AcceptanceCriteriaRequestDTO> acceptanceCriteria;
    private List<Long> relatedTicketsIds;
    private List<Long> blockingTicketIds;
    private List<Long> blockedTicketIds;
}
