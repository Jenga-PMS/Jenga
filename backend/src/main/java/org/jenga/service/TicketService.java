package org.jenga.service;

import org.jenga.db.ProjectRepository;
import org.jenga.db.TicketRepository;
import org.jenga.db.UserRepository;
import org.jenga.db.CommentRepository;
import org.jenga.db.LabelRepository;
import org.jenga.db.AcceptanceCriteriaRepository;
import org.jenga.model.Ticket;
import org.jenga.model.Project;
import org.jenga.model.User;
import org.jenga.model.Comment;
import org.jenga.model.Label;
import org.jenga.model.AcceptanceCriteria;
import org.jenga.dto.TicketResponseDTO;
import org.jenga.dto.TicketRequestDTO;
import org.jenga.dto.TicketSearchDTO;
import org.jenga.dto.CommentRequestDTO;
import org.jenga.dto.CommentResponseDTO;
import org.jenga.dto.AcceptanceCriteriaRequestDTO;
import org.jenga.dto.AcceptanceCriteriaResponseDTO;
import org.jenga.mapper.TicketMapper;
import org.jenga.mapper.CommentMapper;
import org.jenga.mapper.AcceptanceCriteriaMapper;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class TicketService {

    private final TicketRepository ticketRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final LabelRepository labelRepository;
    private final AcceptanceCriteriaRepository acceptanceCriteriaRepository;
    private final TicketMapper ticketMapper;
    private final CommentMapper commentMapper;
    private final AcceptanceCriteriaMapper acceptanceCriteriaMapper;
    private final AuthenticationService authenticationService;

    @Inject
    public TicketService(
        TicketRepository ticketRepository,
        ProjectRepository projectRepository,
        UserRepository userRepository,
        CommentRepository commentRepository,
        LabelRepository labelRepository,
        AcceptanceCriteriaRepository acceptanceCriteriaRepository,
        TicketMapper ticketMapper,
        CommentMapper commentMapper,
        AcceptanceCriteriaMapper acceptanceCriteriaMapper,
        AuthenticationService authenticationService
    ) {
        this.ticketRepository = ticketRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.labelRepository = labelRepository;
        this.acceptanceCriteriaRepository = acceptanceCriteriaRepository;
        this.ticketMapper = ticketMapper;
        this.commentMapper = commentMapper;
        this.acceptanceCriteriaMapper = acceptanceCriteriaMapper;
        this.authenticationService = authenticationService;
    }

    @Transactional
    public TicketResponseDTO create(String projectId, TicketRequestDTO ticketRequestDTO) {
        Project project = projectRepository.findById(projectId);
        if (project == null) {
            throw new NotFoundException("Project not found with name: " + projectId);
        }

        if (ticketRequestDTO.getTitle() == null || ticketRequestDTO.getTitle().isBlank()) {
            throw new IllegalArgumentException("Ticket title cannot be null or empty");
        }

        Ticket ticket = ticketMapper.ticketRequestDTOToTicket(ticketRequestDTO);
        ticket.setProject(project);

        ticket.setTicketNumber(ticketRepository.findMaxTicketNumberByProject(project) + 1);

        User currentUser = authenticationService.getCurrentUser();
        ticket.setReporter(currentUser);

        if (ticketRequestDTO.getAssignee() != null && !ticketRequestDTO.getAssignee().isBlank()) {
            User user = userRepository.findByUsername(ticketRequestDTO.getAssignee());
            if (user != null) {
                ticket.setAssignee(user);
            } else {
                throw new BadRequestException("User not found with username: " + ticketRequestDTO.getAssignee());
            }
        }

        if (ticketRequestDTO.getLabels() != null && !ticketRequestDTO.getLabels().isEmpty()) {
            List<Label> labels = labelRepository.findByProjectIdAndNames(projectId, ticketRequestDTO.getLabels());
            if (labels.size() != ticketRequestDTO.getLabels().size()) {
                throw new BadRequestException("One or more labels do not exist for this project.");
            }
            ticket.setLabels(labels);
        }

        if (ticketRequestDTO.getAcceptanceCriteria() != null && !ticketRequestDTO.getAcceptanceCriteria().isEmpty()) {
            for (AcceptanceCriteriaRequestDTO criteriaRequest : ticketRequestDTO.getAcceptanceCriteria()) {
                AcceptanceCriteria acceptanceCriteria = acceptanceCriteriaMapper.toEntity(criteriaRequest);
                acceptanceCriteria.setTicket(ticket);
                acceptanceCriteriaRepository.persist(acceptanceCriteria);
            }
        }

        ticketRepository.persist(ticket);
        return ticketMapper.ticketToTicketResponseDTO(ticket);
    }
    
    public List<TicketResponseDTO> findAll(String projectId) {
        Project project = projectRepository.findById(projectId);
        if (project == null) {
            throw new NotFoundException("Project not found with name: " + projectId);
        }

        return ticketRepository.findByProjectId(project.getId()).stream()
                .map(ticketMapper::ticketToTicketResponseDTO)
                .collect(Collectors.toList());
    }

    public TicketResponseDTO findById(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId);
        if (ticket == null) {
            throw new NotFoundException("Ticket not found");
        }

        return ticketMapper.ticketToTicketResponseDTO(ticket);
    }

    public TicketResponseDTO findByTicketNumber(String projectId, Long ticketNumber) {
        Project project = projectRepository.findById(projectId);
        if (project == null) {
            throw new NotFoundException("Project not found with name: " + projectId);
        }

        Ticket ticket = ticketRepository.findByTicketNumberAndProjectId(ticketNumber, project.getId());
        if (ticket == null) {
            throw new NotFoundException("Ticket not found");
        }

        return ticketMapper.ticketToTicketResponseDTO(ticket);
    }

    @Transactional
    public TicketResponseDTO update(Long ticketId, TicketRequestDTO ticketDTO) {
        Ticket existing = ticketRepository.findById(ticketId);
        if (existing == null) {
            throw new NotFoundException("Ticket not found");
        }

        existing.setTitle(ticketDTO.getTitle());
        existing.setDescription(ticketDTO.getDescription());
        existing.setPriority(ticketDTO.getPriority());
        existing.setSize(ticketDTO.getSize());
        existing.setStatus(ticketDTO.getStatus());

        if (ticketDTO.getAssignee() != null) {
            User assignee = userRepository.findByUsername(ticketDTO.getAssignee());
            existing.setAssignee(assignee);
        } else {
            existing.setAssignee(null);
        }

        if (ticketDTO.getLabels() != null && !ticketDTO.getLabels().isEmpty()) {
            List<Label> labels = labelRepository.findByProjectIdAndNames(existing.getProject().getId(), ticketDTO.getLabels());
            if (labels.size() != ticketDTO.getLabels().size()) {
                throw new BadRequestException("One or more labels do not exist");
            }
            existing.setLabels(labels);
        } else {
            existing.setLabels(null);
        }

        ticketRepository.persist(existing);
        return ticketMapper.ticketToTicketResponseDTO(existing);
    }

    @Transactional
    public void delete(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId);
        if (ticket == null) {
            throw new NotFoundException("Ticket not found");
        }
        
        // Remove all relating ticktes
        for (Ticket relatedTicket : ticket.getRelatedTickets()) {
            relatedTicket.getRelatedTickets().remove(ticket);
            ticketRepository.persist(relatedTicket);
        }

        // Remove blocking/blocked relationships
        for (Ticket blockingTicket : ticket.getBlockingTickets()) {
            blockingTicket.getBlockedTickets().remove(ticket);
            ticketRepository.persist(blockingTicket);
        }
        
        for (Ticket blockedTicket : ticket.getBlockedTickets()) {
            blockedTicket.getBlockingTickets().remove(ticket);
            ticketRepository.persist(blockedTicket);
        }

        ticketRepository.delete(ticket);
    }

    public List<TicketResponseDTO> searchTickets(TicketSearchDTO request) {
        List<Ticket> tickets = ticketRepository.searchTickets(request);
        return tickets.stream()
                .map(ticketMapper::ticketToTicketResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TicketResponseDTO duplicateTicket(Long ticketId) {
        Ticket originalTicket = ticketRepository.findById(ticketId);

        if (originalTicket == null) {
            throw new NotFoundException("Ticket not found");
        }

        Project project = projectRepository.findById(originalTicket.getProject().getId());

        Ticket duplicatedTicket = new Ticket();
        duplicatedTicket.setTicketNumber(ticketRepository.findMaxTicketNumberByProject(project) + 1);
        duplicatedTicket.setTitle(originalTicket.getTitle());
        duplicatedTicket.setDescription(originalTicket.getDescription());
        duplicatedTicket.setProject(project);
        duplicatedTicket.setPriority(originalTicket.getPriority());
        duplicatedTicket.setSize(originalTicket.getSize());
        duplicatedTicket.setStatus(originalTicket.getStatus());
        duplicatedTicket.setReporter(authenticationService.getCurrentUser());
        duplicatedTicket.setAssignee(originalTicket.getAssignee());

        List<Label> duplicatedLabels = originalTicket.getLabels().stream()
                .map(label -> {
                    Label newLabel = new Label();
                    newLabel.setId(label.getId());
                    newLabel.setName(label.getName());
                    return newLabel;
                })
                .collect(Collectors.toList());

        duplicatedTicket.setLabels(duplicatedLabels);

        List<AcceptanceCriteria> duplicatedCriteria = originalTicket.getAcceptanceCriteria().stream()
                .map(criterion -> {
                    AcceptanceCriteria newCriterion = new AcceptanceCriteria();
                    newCriterion.setDescription(criterion.getDescription());
                    newCriterion.setCompleted(criterion.isCompleted());
                    newCriterion.setTicket(duplicatedTicket);
                    return newCriterion;
                })
                .collect(Collectors.toList());

        duplicatedTicket.setAcceptanceCriteria(duplicatedCriteria);

        ticketRepository.persist(duplicatedTicket);

        return ticketMapper.ticketToTicketResponseDTO(duplicatedTicket);
    }

    @Transactional
    public void assignTicket(Long ticketId, String username) {
        Ticket ticket = ticketRepository.findById(ticketId);
        if (ticket == null) {
            throw new BadRequestException("Ticket not found");
        }
        User assignee = userRepository.findByUsername(username);
        if (assignee == null) {
            throw new BadRequestException("User not found");
        }

        ticket.setAssignee(assignee);
        ticketRepository.persist(ticket);
    }

    @Transactional
    public void unassignTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId);
        if (ticket == null) {
            throw new BadRequestException("Ticket not found");
        }
        ticket.setAssignee(null);
        ticketRepository.persist(ticket);
    }

    @Transactional
    public CommentResponseDTO createComment(Long ticketId, CommentRequestDTO commentDTO) {
        Ticket ticket = ticketRepository.findById(ticketId);
        if (ticket == null) {
            throw new RuntimeException("Ticket not found");
        }

        Comment comment = commentMapper.commentRequestDTOToComment(commentDTO);

        User currentUser = authenticationService.getCurrentUser();
        comment.setAuthor(currentUser);

        comment.setTicket(ticket);

        commentRepository.persist(comment);

        return commentMapper.commentToCommentResponseDTO(comment);
    }

    public List<CommentResponseDTO> getAllComments(Long ticketId) {
        List<Comment> comments = commentRepository.findByTicketId(ticketId);

        return comments.stream()
                .map(commentMapper::commentToCommentResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long ticketId, Long commentId) {
        Comment comment = commentRepository.findByIdAndTicketId(commentId, ticketId);
        if (comment == null) {
            throw new NotFoundException("Comment not found");
        }

        commentRepository.deleteByIdAndTicketId(commentId, ticketId);
    }

    @Transactional
    public AcceptanceCriteriaResponseDTO addAcceptanceCriteria(Long ticketId, AcceptanceCriteriaRequestDTO request) {
        Ticket ticket = ticketRepository.findById(ticketId);
        if (ticket == null) {
            throw new NotFoundException("Ticket not found");
        }

        AcceptanceCriteria criteria = acceptanceCriteriaMapper.toEntity(request);
        criteria.setTicket(ticket);

        acceptanceCriteriaRepository.persist(criteria);
        return acceptanceCriteriaMapper.toResponse(criteria);
    }

    public List<AcceptanceCriteriaResponseDTO> getAllAcceptanceCriteria(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId);
        if (ticket == null) {
            throw new NotFoundException("Ticket not found");
        }

        List<AcceptanceCriteria> criteriaList = acceptanceCriteriaRepository.findByTicketId(ticketId);
        return criteriaList.stream()
                .map(acceptanceCriteriaMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AcceptanceCriteriaResponseDTO updateAcceptanceCriteria(Long ticketId, Long criteriaId, AcceptanceCriteriaRequestDTO request) {
        Ticket ticket = ticketRepository.findById(ticketId);
        if (ticket == null) {
            throw new NotFoundException("Ticket not found");
        }

        AcceptanceCriteria criteria = acceptanceCriteriaRepository.findByIdAndTicketId(criteriaId, ticketId);
        if (criteria == null) {
            throw new NotFoundException("Acceptance criteria not found");
        }

        criteria.setDescription(request.getDescription());
        criteria.setCompleted(request.isCompleted());

        acceptanceCriteriaRepository.persist(criteria);
        return acceptanceCriteriaMapper.toResponse(criteria);
    }

    @Transactional
    public void deleteAcceptanceCriteria(Long ticketId, Long criteriaId) {
        Ticket ticket = ticketRepository.findById(ticketId);
        if (ticket == null) {
            throw new NotFoundException("Ticket not found");
        }

        AcceptanceCriteria criteria = acceptanceCriteriaRepository.findByIdAndTicketId(criteriaId, ticketId);
        if (criteria == null) {
            throw new NotFoundException("Acceptance criteria not found");
        }

        acceptanceCriteriaRepository.deleteByIdAndTicketId(criteriaId, ticketId);
    }

    @Transactional
    public void addRelatedTicket(Long ticketId, Long relatedTicketId) {
        Ticket ticket = ticketRepository.findById(ticketId);
        if (ticket == null) {
            throw new NotFoundException("Ticket not found");
        }

        Ticket relatedTicket = ticketRepository.findById(relatedTicketId);
        if (relatedTicket == null) {
            throw new NotFoundException("Related ticket not found");
        }

        ticket.getRelatedTickets().add(relatedTicket);

        relatedTicket.getRelatedTickets().add(ticket);

        // Persist changes to both tickets, so both are linking each other
        ticketRepository.persist(ticket);
        ticketRepository.persist(relatedTicket);
    }

    @Transactional
    public void removeRelatedTicket(Long ticketId, Long relatedTicketId) {
        Ticket ticket = ticketRepository.findById(ticketId);
        if (ticket == null) {
            throw new NotFoundException("Ticket not found");
        }

        Ticket relatedTicket = ticketRepository.findById(relatedTicketId);
        if (relatedTicket == null) {
            throw new NotFoundException("Related ticket not found");
        }

        ticket.getRelatedTickets().remove(relatedTicket);

        relatedTicket.getRelatedTickets().remove(ticket);

        // Persist changes to both tickets, so both are linking each other
        ticketRepository.persist(ticket);
        ticketRepository.persist(relatedTicket);
    }

    @Transactional
    public void addBlockingTicket(Long ticketId, Long blockingTicketId) {
        Ticket ticket = ticketRepository.findById(ticketId);
        if (ticket == null) {
            throw new NotFoundException("Ticket not found");
        }

        Ticket blockingTicket = ticketRepository.findById(blockingTicketId);
        if (blockingTicket == null) {
            throw new NotFoundException("Blocking ticket not found");
        }

        ticket.getBlockingTickets().add(blockingTicket);
        ticketRepository.persist(ticket);
    }

    @Transactional
    public void removeBlockingTicket(Long ticketId, Long blockingTicketId) {
        Ticket ticket = ticketRepository.findById(ticketId);
        if (ticket == null) {
            throw new NotFoundException("Ticket not found");
        }

        Ticket blockingTicket = ticketRepository.findById(blockingTicketId);
        if (blockingTicket == null) {
            throw new NotFoundException("Blocking ticket not found");
        }

        ticket.getBlockingTickets().remove(blockingTicket);
        ticketRepository.persist(ticket);
    }
}
