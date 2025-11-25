package org.jenga.rest;

import org.jenga.service.ProjectService;
import org.jenga.dto.ProjectRequestDTO;
import org.jenga.dto.ProjectResponseDTO;
import org.jenga.dto.LabelDTO;


import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/projects")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ProjectResource {

    @Inject
    ProjectService projectService;

    @POST
    public ProjectResponseDTO createProject(ProjectRequestDTO projectRequestDTO) {
        return projectService.create(projectRequestDTO);
    }

    @GET
    public List<ProjectResponseDTO> getAllProjects() {
        return projectService.findAll();
    }

    @GET
    @Path("/{projectId}")
    public ProjectResponseDTO getProjectByIdentifier(@PathParam("projectId") String projectId) {
        return projectService.findById(projectId);
    }

    @PUT
    @Path("/{projectId}")
    public ProjectResponseDTO updateProject(@PathParam("projectId") String projectId, ProjectRequestDTO projectRequestDTO) {
        return projectService.update(projectId, projectRequestDTO);
    }

    @DELETE
    @Path("/{projectId}")
    public Response deleteProject(@PathParam("projectId") String projectId) {
        projectService.delete(projectId);
        return Response.noContent().build();
    }

    @POST
    @Path("/{projectId}/labels")
    public LabelDTO createLabel(@PathParam("projectId") String projectId, LabelDTO labelDTO) {
        return projectService.createLabel(projectId, labelDTO);
    }

    @GET
    @Path("/{projectId}/labels")
    public List<LabelDTO> getAllLabels(@PathParam("projectId") String projectId) {
        return projectService.getAllLabels(projectId);
    }

    @DELETE
    @Path("/{projectId}/labels/{labelName}")
    public Response deleteLabel(@PathParam("projectId") String projectId, @PathParam("labelName") String labelName) {
        projectService.deleteLabel(projectId, labelName);
        return Response.noContent().build();
    }
}
