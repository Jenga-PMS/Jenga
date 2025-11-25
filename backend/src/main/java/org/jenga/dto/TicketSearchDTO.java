package org.jenga.dto;

import java.util.List;

import org.jenga.model.TicketPriority;
import org.jenga.model.TicketSize;
import org.jenga.model.TicketStatus;

import lombok.Data;

@Data
public class TicketSearchDTO{
    private String projectId;
    private String query;
    private String title;
    private String description;
    private Filter filter;
    private Integer limit;

    @Data
    public static class Filter {
        private List<TicketPriority> priority;
        private List<TicketSize> size;
        private List<TicketStatus> status;
        private List<String> reporter;
        private List<String> assignee;
        private List<String> labels;
    }
}
