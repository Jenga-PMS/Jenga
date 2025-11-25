package org.jenga.mapper;

import org.jenga.model.Project;
import org.jenga.dto.ProjectResponseDTO;
import org.jenga.dto.ProjectRequestDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "cdi")
public interface ProjectMapper {

    ProjectMapper INSTANCE = Mappers.getMapper(ProjectMapper.class);

    @Mapping(source = "id", target = "identifier")
    ProjectResponseDTO projectToProjectDTO(Project project);

    @Mapping(source = "identifier", target = "id")
    Project createProjectDTOToProject(ProjectRequestDTO projectRequestDTO);
}
