package org.jenga.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jenga.db.ProjectRepository;
import org.jenga.db.TicketRepository;
import org.jenga.db.UserRepository;
import org.jenga.db.LabelRepository;
import org.jenga.dto.GitHubIssueDTO;
import org.jenga.dto.ImportReportDTO;

import org.jenga.model.AcceptanceCriteria;
import org.jenga.dto.TicketRequestDTO;
import org.jenga.model.Label;
import org.jenga.model.Project;
import org.jenga.model.Ticket;
import org.jenga.model.TicketStatus;
import org.jenga.model.User;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@ApplicationScoped
public class ImportService {

    @Inject
    TicketRepository ticketRepository;
    @Inject
    ProjectRepository projectRepository;
    @Inject
    UserRepository userRepository;
    @Inject
    LabelRepository labelRepository;
    @Inject
    AuthenticationService authenticationService;

    @Transactional
    public ImportReportDTO importFromGitHub(String projectId, List<GitHubIssueDTO> githubIssues) {
        
        int successfulImportCount = 0;
        List<String> failedImports = new ArrayList<>();

        Project project = projectRepository.findById(projectId);
        if (project == null) {
            failedImports.add("Fatal: Project not found with ID: " + projectId);
            return new ImportReportDTO(0, failedImports);
        }
        
        User reporter = authenticationService.getCurrentUser();

        for (GitHubIssueDTO githubDto : githubIssues) {
            try {
                Ticket ticket = new Ticket();
                ticket.setProject(project);
                ticket.setTitle(githubDto.getTitle());

                String body = githubDto.getBody();
                List<AcceptanceCriteria> acceptanceCriteria = new ArrayList<>();
                List<String> descriptionLines = new ArrayList<>(); 

                if (body != null && !body.isEmpty()) {
                    String[] lines = body.split("\\r?\\n");

                    for (String line : lines) {
                        String trimmedLine = line.trim();

                        if (trimmedLine.startsWith("- [ ] ") || trimmedLine.startsWith("- [x] ")) {
                            boolean isCompleted = trimmedLine.startsWith("- [x] ");
                            
                            if (trimmedLine.length() > 6) {
                                String criteriaText = trimmedLine.substring(6).trim();
                                
                                if (!criteriaText.isEmpty()) {
                                    AcceptanceCriteria ac = new AcceptanceCriteria();
                                    
                                    ac.setDescription(criteriaText); 
                                    ac.setCompleted(isCompleted);
                                    ac.setTicket(ticket);
                                    
                                    acceptanceCriteria.add(ac);
                                }
                            }
                        } else {
                            descriptionLines.add(line);
                        }
                    }

                    String finalDescription = String.join("\n", descriptionLines).trim();
                    ticket.setDescription(finalDescription);
                    ticket.setAcceptanceCriteria(acceptanceCriteria);
                }
                
                ticket.setTicketNumber(ticketRepository.findMaxTicketNumberByProject(project) + 1);
                ticket.setReporter(reporter);
                
                if (githubDto.getAssignees() != null && githubDto.getAssignees().length > 0) {
                    String username = githubDto.getAssignees()[0].getLogin();
                    User assignee = userRepository.findByUsername(username);
                    if (assignee != null) {
                        ticket.setAssignee(assignee);
                    } else {
                        System.err.println("Import Warning: Assignee not found, skipping: " + username);
                    }
                }

                if (githubDto.getLabels() != null && githubDto.getLabels().length > 0) {
                    Set<Label> labelsToAttach = new HashSet<>();
                    for (GitHubIssueDTO.GitHubLabelDTO labelDto : githubDto.getLabels()) {
                        String labelName = labelDto.getName();
                        
                        Label label = labelRepository.find("project = ?1 and name = ?2", project, labelName).firstResult();

                        if (label == null) {
                            label = new Label();
                            label.setName(labelName);
                            label.setProject(project);
                            label.setColor(labelDto.getColor());
                            labelRepository.persist(label);
                        }
                        labelsToAttach.add(label);
                    }
                    ticket.setLabels(new ArrayList<>(labelsToAttach));
                }
                
                ticket.setStatus(mapStatusFromDto(githubDto));

                ticketRepository.persist(ticket);
                successfulImportCount++; 

            } catch (Exception e) {
                failedImports.add("Failed to import ticket '" + githubDto.getTitle() + "': " + e.getMessage());
            }
        }
        
        return new ImportReportDTO(successfulImportCount, failedImports);
    }
    
    private TicketStatus mapStatusFromDto(GitHubIssueDTO githubDto) {
        if (githubDto.getStatus() == null || githubDto.getStatus().length == 0 || githubDto.getStatus()[0].getStatus() == null) {
            return TicketStatus.OPEN;
        }
        
        String githubStatusName = githubDto.getStatus()[0].getStatus().getName();
        switch (githubStatusName.toUpperCase()) {
            case "OPEN":
            case "BACKLOG":
            case "NO STATUS":
                return TicketStatus.OPEN;
            case "IN PROGRESS": 
                return TicketStatus.IN_PROGRESS;
            case "IN REVIEW":
            case "IN TEST":
                return TicketStatus.IN_REVIEW;
            case "RESOLVED":
                return TicketStatus.RESOLVED;
            case "CLOSED":
            case "DONE":
                return TicketStatus.CLOSED;
            case "ON HOLD":
                return TicketStatus.ON_HOLD;
            default:
                System.err.println("Warning: Unrecognized status '" + githubStatusName + "'. Defaulting to OPEN.");
                return TicketStatus.OPEN; 
        }
    }

    @Transactional
    public ImportReportDTO importFromJenga(String projectId, List<TicketRequestDTO> ticketRequests) {
        
        List<String> errors = new ArrayList<>();
        int successfulImports = 0;

        Project project = projectRepository.findById(projectId);
        if (project == null) {
            errors.add("Project with ID " + projectId + " not found. No tickets were imported.");
            return new ImportReportDTO(0, errors);
        }

        for (TicketRequestDTO request : ticketRequests) {
            try {
                Ticket ticket = new Ticket();

                ticket.setTitle(request.getTitle());
                ticket.setDescription(request.getDescription());
                ticket.setPriority(request.getPriority());
                ticket.setSize(request.getSize());
                ticket.setStatus(request.getStatus()); 
                if (request.getLabels() != null && !request.getLabels().isEmpty()) {
                    List<Label> labelEntities = new ArrayList<>();
                    
                    for (String labelName : request.getLabels()) {
                        Label label = labelRepository.find("name", labelName).firstResult();

                        if (label == null) {
                            label = new Label();
                            label.setName(labelName);                            
                            labelRepository.persist(label);
                        }
                        
                        labelEntities.add(label);
                    }

                    ticket.setLabels(labelEntities);
                }

                ticket.setTicketNumber(ticketRepository.findMaxTicketNumberByProject(project) + 1);
                
                ticket.setProject(project); 

                User reporter = userRepository.findByUsername(request.getReporter());
                if (reporter == null) {
                    throw new RuntimeException("Reporter not found: " + request.getReporter());
                }
                ticket.setReporter(reporter);

                if (request.getAssignee() != null && !request.getAssignee().isEmpty()) {
                    User assignee = userRepository.findByUsername(request.getAssignee());
                    if (assignee == null) {
                        throw new RuntimeException("Assignee not found: " + request.getAssignee());
                    }
                    ticket.setAssignee(assignee);
                }

                if (request.getAcceptanceCriteria() != null) {
                    List<AcceptanceCriteria> criteriaList = request.getAcceptanceCriteria().stream()
                        .map(dto -> {
                            AcceptanceCriteria ac = new AcceptanceCriteria();
                            ac.setDescription(dto.getDescription());
                            ac.setTicket(ticket); 
                            return ac;
                        })
                        .toList();
                    ticket.setAcceptanceCriteria(criteriaList);
                }

                ticketRepository.persist(ticket);
                successfulImports++;

            } catch (Exception e) {
                String errorMessage = "Failed to import ticket '" + request.getTitle() + "': " + e.getMessage();
                errors.add(errorMessage);
            }
        }

        return new ImportReportDTO(successfulImports, errors);
    }
}