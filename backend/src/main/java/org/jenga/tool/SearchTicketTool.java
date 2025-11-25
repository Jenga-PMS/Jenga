package org.jenga.tool;

import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jenga.dto.TicketResponseDTO;
import org.jenga.dto.TicketSearchDTO;
import org.jenga.model.TicketPriority;
import org.jenga.model.TicketSize;
import org.jenga.model.TicketStatus;
import org.jenga.service.TicketService;

import java.util.List;

@ApplicationScoped
public class SearchTicketTool {

    @Inject
    TicketService ticketService;

    @Tool("""
        Searches for tickets based on criteria. 
        Use this when the user asks to find multiple tickets, filter by status/priority, 
        or search for specific keywords in the title/description.
        """)
    @Transactional
    public List<TicketResponseDTO> searchTickets(
            @P("The search query text for title or description (e.g., 'database error', 'login page')")
            String query,
            
            @P("Filter by a specific ticket title")
            String title,
            
            @P("Search for text within the ticket description")
            String description,
            
            @P("Filter by list of priorities (e.g., HIGH, CRITICAL)")
            List<TicketPriority> priorities,
            
            @P("Filter by list of statuses (e.g., OPEN, IN_PROGRESS)")
            List<TicketStatus> statuses,
            
            @P("Filter by list of sizes (e.g., SMALL, LARGE)")
            List<TicketSize> sizes,
            
            @P("Filter by a list of assignee usernames")
            List<String> assignees,
            
            @P("Filter by a list of reporter usernames")
            List<String> reporters,
            
            @P("Filter by a list of labels (e.g., 'bug', 'feature')")
            List<String> labels,
            
            @P("Filter by a specific project ID")
            String projectId,
            
            @P("Limit the number of results (default to 5 if not specified)")
            Integer limit
    ) {
        TicketSearchDTO request = new TicketSearchDTO();
        TicketSearchDTO.Filter filter = new TicketSearchDTO.Filter();

        request.setQuery(query);
        request.setTitle(title);
        request.setDescription(description);
        request.setProjectId(projectId);
        request.setLimit(limit != null ? limit : 5);

        if (priorities != null && !priorities.isEmpty()) {
            filter.setPriority(priorities);
        }
        if (statuses != null && !statuses.isEmpty()) {
            filter.setStatus(statuses);
        }
        if (sizes != null && !sizes.isEmpty()) {
            filter.setSize(sizes);
        }
        if (assignees != null && !assignees.isEmpty()) {
            filter.setAssignee(assignees);
        }
        if (reporters != null && !reporters.isEmpty()) {
            filter.setReporter(reporters);
        }
        if (labels != null && !labels.isEmpty()) {
            filter.setLabels(labels);
        }

        request.setFilter(filter);

        return ticketService.searchTickets(request);
    }
}