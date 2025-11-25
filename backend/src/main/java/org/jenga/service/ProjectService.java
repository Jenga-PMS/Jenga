package org.jenga.service;

import org.jenga.db.ProjectRepository;
import org.jenga.db.LabelRepository;
import org.jenga.model.Project;
import org.jenga.model.Ticket;
import org.jenga.model.Label;
import org.jenga.dto.ProjectRequestDTO;
import org.jenga.dto.ProjectResponseDTO;
import org.jenga.dto.LabelDTO;
import org.jenga.mapper.ProjectMapper;
import org.jenga.mapper.LabelMapper;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final LabelRepository labelRepository;
    private final ProjectMapper projectMapper;
    private final LabelMapper labelMapper;

    @Inject
    public ProjectService(
        ProjectRepository projectRepository, 
        LabelRepository labelRepository,
        ProjectMapper projectMapper,
        LabelMapper labelMapper
    ) {
        this.projectRepository = projectRepository;
        this.labelRepository = labelRepository;
        this.projectMapper = projectMapper;
        this.labelMapper = labelMapper;
    }

    @Transactional
    public ProjectResponseDTO create(ProjectRequestDTO projectRequestDTO) {
        String identifier = projectRequestDTO.getIdentifier();

        if (identifier == null || identifier.trim().isEmpty()) {
            throw new BadRequestException("Project identifier cannot be empty");
        }

        if (identifier.length() > 10) {
            throw new BadRequestException("Project identifier cannot exceed 10 characters");
        }

        if (!identifier.equals(identifier.trim())) {
            throw new BadRequestException("Project identifier cannot have leading or trailing spaces");
        }

        if (identifier.contains(" ")) {
            throw new BadRequestException("Project identifier cannot contain spaces");
        }

        if (!identifier.matches("[a-zA-Z0-9]+")) {
            throw new BadRequestException("Project identifier must only contain letters and numbers (no special characters)");
        }

        Project existingProject = projectRepository.findById(identifier);
        if (existingProject != null) {
            throw new BadRequestException("Project already exists with this identifier");
        }

        Project project = projectMapper.createProjectDTOToProject(projectRequestDTO);

        projectRepository.persist(project);

        return projectMapper.projectToProjectDTO(project);
    }

    public List<ProjectResponseDTO> findAll() {
        return projectRepository.findAll().stream()
                .map(projectMapper::projectToProjectDTO)
                .collect(Collectors.toList());
    }

    public ProjectResponseDTO findById(String projectId) {
        Project project = projectRepository.findById(projectId);
        if (project == null) {
            throw new NotFoundException("Project not found with ID: " + projectId);
        }
        return projectMapper.projectToProjectDTO(project);
    }

    @Transactional
    public ProjectResponseDTO update(String projectId, ProjectRequestDTO projectRequestDTO) {
        Project existing = projectRepository.findById(projectId);
        if (existing == null) {
            throw new NotFoundException("Project not found with ID: " + projectId);
        }

        existing.setId(projectRequestDTO.getIdentifier());
        existing.setName(projectRequestDTO.getName());
        existing.setDescription(projectRequestDTO.getDescription());

        projectRepository.persist(existing);
        return projectMapper.projectToProjectDTO(existing);
    }

    @Transactional
    public void delete(String projectId) {
        Project project = projectRepository.findById(projectId);
        if (project == null) {
            throw new NotFoundException("Project not found with ID: " + projectId);
        }

        projectRepository.delete(project);
    }

    @Transactional
    public LabelDTO createLabel(String projectId, LabelDTO labelDTO) {
        Project project = projectRepository.findById(projectId);
        if (project == null) {
            throw new NotFoundException("Project not found with ID: " + projectId);
        }

        boolean labelExists = labelRepository.findByProjectIdAndLabelName(projectId, labelDTO.getName()) != null;
        if (labelExists) {
            throw new BadRequestException("Label already exists");
        }

        if (!isValidHexColor(labelDTO.getColor())) {
            throw new BadRequestException("Invalid color format. Color format must be #RRGGBB");
        }

        Label label = labelMapper.labelDTOToLabel(labelDTO);
        label.setProject(project);
        labelRepository.persist(label);
        return labelMapper.labelToLabelDTO(label);
    }

    private boolean isValidHexColor(String color) {
        return color != null && color.matches("^#(?:[0-9a-fA-F]{3}){1,2}$");
    }

    public List<LabelDTO> getAllLabels(String projectId) {
        List<Label> labels = labelRepository.findByProjectId(projectId);

        return labels.stream()
                     .map(labelMapper::labelToLabelDTO)
                     .collect(Collectors.toList());
    }

    @Transactional
    public void deleteLabel(String projectId, String labelName) {
        Label label = labelRepository.findByProjectIdAndLabelName(projectId, labelName);
        if (label != null) {
            for (Ticket ticket : label.getTickets()) {
                ticket.getLabels().remove(label);
            }

            labelRepository.delete(label);
        } else {
            throw new NotFoundException("Label not found");
        }
    }
}
