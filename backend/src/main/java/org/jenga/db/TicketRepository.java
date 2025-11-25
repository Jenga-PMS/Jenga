package org.jenga.db;

import org.jenga.model.Ticket;
import org.jenga.model.Project;
import org.jenga.dto.TicketSearchDTO;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@ApplicationScoped
public class TicketRepository implements PanacheRepository<Ticket> {
    public List<Ticket> findByProjectId(String projectId) {
        return find("project.id", projectId).list();
    }

    public Ticket findByTicketNumberAndProjectId(Long ticketNumber, String projectId) {
        return find("ticketNumber = ?1 and project.id= ?2", ticketNumber, projectId).firstResult();
    }

    public Long findMaxTicketNumberByProject(Project project) {
        Ticket ticket = find("project = ?1 and ticketNumber is not null", 
                            Sort.by("ticketNumber", Sort.Direction.Descending), project)
                            .firstResult();
        return ticket != null && ticket.getTicketNumber() != null ? ticket.getTicketNumber() : 0L;
    }

    public boolean existsByGithubIssueId(Long githubIssueId) {
        return count("githubIssueId", githubIssueId) > 0;
    }

    public List<Ticket> searchTickets(TicketSearchDTO request) {
        StringBuilder jpql = new StringBuilder("SELECT t FROM Ticket t WHERE 1 = 1");
        Map<String, Object> params = new HashMap<>();

        if (request.getProjectId() != null && !request.getProjectId().isBlank()) {
           jpql.append(" AND t.project.id = :projectId");
           params.put("projectId", request.getProjectId());
        }

        if (request.getQuery() != null && !request.getQuery().isBlank()) {
           String like = "%" + request.getQuery().toLowerCase() + "%";
           jpql.append(" AND (LOWER(t.title) LIKE :query OR LOWER(t.description) LIKE :query)");
           params.put("query", like);
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            String likeTitle = "%" + request.getTitle().toLowerCase() + "%";
            jpql.append(" AND LOWER(t.title) LIKE :title");
            params.put("title", likeTitle);
        }

        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            String likeDescription = "%" + request.getDescription().toLowerCase() + "%";
            jpql.append(" AND LOWER(t.description) LIKE :description");
            params.put("description", likeDescription);
        }

        TicketSearchDTO.Filter filter = request.getFilter();
        if (filter != null) {
            if (filter.getPriority() != null && !filter.getPriority().isEmpty()) {
               jpql.append(" AND t.priority IN :priority");
               params.put("priority", filter.getPriority());
            }

            if (filter.getSize() != null && !filter.getSize().isEmpty()) {
               jpql.append(" AND t.size IN :size");
               params.put("size", filter.getSize());
            }

            if (filter.getStatus() != null && !filter.getStatus().isEmpty()) {
               jpql.append(" AND t.status IN :status");
               params.put("status", filter.getStatus());
            }

            if (filter.getReporter() != null && !filter.getReporter().isEmpty()) {
               jpql.append(" AND t.reporter.username IN :reporter");
               params.put("reporter", filter.getReporter());
            }

            if (filter.getAssignee() != null && !filter.getAssignee().isEmpty()) {
               jpql.append(" AND t.assignee.username IN :assignee");
               params.put("assignee", filter.getAssignee());
            }

            // TODO: All labels of the filter need to be present in the ticket for it not get filtered out
            if (filter.getLabels() != null && !filter.getLabels().isEmpty()) {
                jpql.append(" AND EXISTS (SELECT 1 FROM t.labels l WHERE l.name IN :labels)");
                params.put("labels", filter.getLabels());
            }
        }

        int limit = (request.getLimit() != null && request.getLimit() > 0) ? request.getLimit() : 25;

        return find(jpql.toString(), params).page(Page.of(0, limit)).list();
    }
}
