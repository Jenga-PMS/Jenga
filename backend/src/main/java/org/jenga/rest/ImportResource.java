package org.jenga.rest;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jenga.dto.GitHubIssueDTO;
import org.jenga.dto.ImportReportDTO;
import org.jenga.dto.TicketRequestDTO;
import org.jenga.service.ImportService; 

import java.util.List;

@Path("/api/import")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ImportResource {

    @Inject 
    ImportService importService; 

    @POST
    @Path("/{projectId}/github")
    public Response importFromGitHub(
                @PathParam("projectId") String projectId, 
                List<GitHubIssueDTO> githubIssues) { 

        ImportReportDTO report = importService.importFromGitHub(projectId, githubIssues);
        
        return Response.ok(report).build();
    }

    @POST
    @Path("/{projectId}/import")
    public Response importFromJenga(
                @PathParam("projectId") String projectId, 
                List<TicketRequestDTO> jengaIssues) { 

        ImportReportDTO report = importService.importFromJenga(projectId, jengaIssues);
        
        return Response.ok(report).build();
    }
}