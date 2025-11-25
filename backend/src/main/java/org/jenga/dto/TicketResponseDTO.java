package org.jenga.dto;

import java.util.List;

import java.time.LocalDateTime;
import org.jenga.model.TicketPriority;
import org.jenga.model.TicketSize;
import org.jenga.model.TicketStatus;

import lombok.Data;

@Data
public class TicketResponseDTO {
    private Long id;
    private Long ticketNumber;
    private String title;
    private String description;
    private String projectName;
    private TicketPriority priority;
    private TicketSize size;
    private TicketStatus status;
    private LocalDateTime createDate;
    private LocalDateTime modifyDate;
    private String reporter;
    private String assignee;
    private List<String> labels;
    private List<AcceptanceCriteriaResponseDTO> acceptanceCriteria;
    private List<Long> relatedTicketsIds;
    private List<Long> blockingTicketIds;
    private List<Long> blockedTicketIds;
}
