package org.jenga.tool;

import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import org.jenga.db.LabelRepository;
import org.jenga.db.ProjectRepository;
import org.jenga.db.TicketRepository;
import org.jenga.db.UserRepository;
import org.jenga.model.*;
import org.jenga.service.MCP_Server.ChatRequestContext;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@ApplicationScoped
public class CreateTicketTool {

    @Inject
    TicketRepository ticketRepository;
    @Inject
    ProjectRepository projectRepository;
    @Inject
    UserRepository userRepository;
    @Inject
    LabelRepository labelRepository;
    @Inject
    ChatRequestContext requestContext;

    @Tool("Creates a new software development ticket (e.g., bug, feature, task) in the specified project.")
    @Transactional 
    public String createTicket(
            @P("The title or summary of the ticket. This is mandatory.")
            String title,

            @P("A detailed description of the ticket, including steps to reproduce for bugs. This is mandatory.")
            String description,

            @P("The project ID (e.g., 'MCP', 'Frontend'). If not provided, the user's current project will be used.")
            Long projectId, 
            
            @P("The username of the person reporting the ticket. If null, 'unassigned', or empty, it defaults to the current user.") 
            String reporterUsername, 

            @P("The username of the person to assign the ticket to. If null, 'unassigned', or empty, it defaults to the current user.")
            String assigneeUsername, 

            @P("The priority of the ticket. Valid values are LOW, MEDIUM, HIGH, CRITICAL. Can be null.")
            TicketPriority priority,

            @P("The estimated size or effort. Valid values are SMALL, MEDIUM, LARGE, EXTRA_LARGE. Can be null.")
            TicketSize size,

            @P("A comma-separated string of label names to add to the ticket, e.g., 'bug,ui,backend'. Can be null or empty.")
            String labels,

            @P("A semicolon-separated list of acceptance criteria, e.g., 'User can login; Password is validated; Error message shows'. Can be null or empty.")
            String acceptanceCriteria
    ) {
        try {
            Long finalProjectId = (projectId != null && projectId > 0) 
                                    ? projectId 
                                    : requestContext.getCurrentProjectID();

            if (finalProjectId == null || finalProjectId < 0) {
                return "ERROR: Could not create ticket. Reason: Project ID is mandatory. Please specify a project.";
            }

            Project project = projectRepository.findById(finalProjectId);
            if (project == null) {
                return "ERROR: Could not create ticket. Reason: Project not found with ID: " + finalProjectId;
            }

            String finalReporterUsername = (reporterUsername != null && !reporterUsername.isEmpty() && !reporterUsername.equalsIgnoreCase("unassigned"))
                                           ? reporterUsername
                                           : requestContext.getCurrentUser();
            
            String finalAssigneeUsername = (assigneeUsername != null && !assigneeUsername.isEmpty() && !assigneeUsername.equalsIgnoreCase("unassigned"))
                                           ? assigneeUsername
                                           : requestContext.getCurrentUser();

            Ticket newTicket = new Ticket();
            newTicket.setTitle(title);
            newTicket.setDescription(description);
            newTicket.setProject(project);
            newTicket.setStatus(TicketStatus.OPEN); 

            if (finalReporterUsername != null && !finalReporterUsername.isEmpty()) {
                User reporter = userRepository.findByUsername(finalReporterUsername);
                if (reporter != null) {
                    newTicket.setReporter(reporter);
                }
            }

            if (priority != null) {
                newTicket.setPriority(priority);
            }
            if (size != null) {
                newTicket.setSize(size);
            }

            if (finalAssigneeUsername != null && !finalAssigneeUsername.isEmpty()) {
                User assignee = userRepository.findByUsername(finalAssigneeUsername);
                if (assignee != null) {
                    newTicket.setAssignee(assignee);
                }
            }

            if (labels != null && !labels.trim().isEmpty()) {
                Set<Label> labelsToAttach = new HashSet<>();
                String[] labelNames = labels.split(",");
                for (String labelName : labelNames) {
                    labelName = labelName.trim();
                    if (labelName.isEmpty()) continue;
                    Label label = labelRepository.find("project = ?1 and name = ?2", project, labelName).firstResult();
                    if (label == null) {
                        label = new Label();
                        label.setName(labelName);
                        label.setProject(project);
                        labelRepository.persist(label);
                    }
                    labelsToAttach.add(label);
                }
                newTicket.setLabels(new ArrayList<>(labelsToAttach));
            } else {
                newTicket.setLabels(Collections.emptyList());
            }

            if (acceptanceCriteria != null && !acceptanceCriteria.trim().isEmpty()) {
                List<AcceptanceCriteria> criteriaList = new ArrayList<>();
                String[] criteriaItems = acceptanceCriteria.split(";");
                for (String criteriaText : criteriaItems) {
                    criteriaText = criteriaText.trim();
                    if (criteriaText.isEmpty()) continue;
                    AcceptanceCriteria criteria = new AcceptanceCriteria();
                    criteria.setDescription(criteriaText);
                    criteria.setCompleted(false);
                    criteria.setTicket(newTicket);
                    criteriaList.add(criteria);
                }
                newTicket.setAcceptanceCriteria(criteriaList);
            } else {
                newTicket.setAcceptanceCriteria(Collections.emptyList());
            }

            newTicket.setTicketNumber(ticketRepository.findMaxTicketNumberByProject(project) + 1);
            ticketRepository.persist(newTicket);

            return "SUCCESS: Created new ticket " +
                   newTicket.getProject().getId() + "-" + newTicket.getTicketNumber() +
                   ": '" + newTicket.getTitle() + "'.";

        } catch (Exception e) {
            return "ERROR: An unexpected error occurred: " + e.getMessage();
        }
    }
}