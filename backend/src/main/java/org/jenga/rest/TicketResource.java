package org.jenga.rest;

import org.jenga.service.TicketService;
import org.jenga.dto.TicketResponseDTO;
import org.jenga.dto.TicketRequestDTO;
import org.jenga.dto.TicketSearchDTO;
import org.jenga.dto.CommentRequestDTO;
import org.jenga.dto.CommentResponseDTO;
import org.jenga.dto.AcceptanceCriteriaRequestDTO;
import org.jenga.dto.AcceptanceCriteriaResponseDTO;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/tickets")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class TicketResource {

    @Inject
    TicketService ticketService;

    @POST
    @Path("/{projectId}")
    public TicketResponseDTO createTicket(@PathParam("projectId") String projectId, TicketRequestDTO ticketRequestDTO) {
        return ticketService.create(projectId, ticketRequestDTO);
    }

    @GET
    @Path("/{projectId}/all")
    public List<TicketResponseDTO> getAllTickets(@PathParam("projectId") String projectId) {
        return ticketService.findAll(projectId);
    }

    @GET
    @Path("/{ticketId}")
    public TicketResponseDTO getTicketById(@PathParam("ticketId") Long ticketId) {
        return ticketService.findById(ticketId);
    }

    @GET
    @Path("/{projectId}/{ticketNumber}")
    public TicketResponseDTO getTicketByNumber(@PathParam("projectId") String projectId, @PathParam("ticketNumber") Long ticketNumber) {
        return ticketService.findByTicketNumber(projectId, ticketNumber);
    }

    @PUT
    @Path("/{ticketId}")
    public TicketResponseDTO updateTicket(@PathParam("ticketId") Long ticketId, TicketRequestDTO ticketDTO) {
        return ticketService.update(ticketId, ticketDTO);
    }

    @DELETE
    @Path("/{ticketId}")
    public Response deleteTicket(@PathParam("ticketId") Long ticketId) {
        ticketService.delete(ticketId);
        return Response.noContent().build();
    }

    /*
    @GET
    @Path("/search")
    public Response searchTicketsGet(@BeanParam TicketSearchDTO request) {
        List<TicketResponseDTO> results = ticketService.searchTickets(request);
        return Response.ok(results).build();
    }
    */

    @POST
    @Path("/search")
    public List<TicketResponseDTO> searchTickets(TicketSearchDTO request) {
            System.out.println("POST /search/");
    System.out.println("Body: " + request);
        List<TicketResponseDTO> results = ticketService.searchTickets(request);
        return results;
    }

    @POST
    @Path("/{ticketId}/duplicate")
    public TicketResponseDTO duplicateTicket(@PathParam("ticketId") Long ticketId) {
        return ticketService.duplicateTicket(ticketId);
    }

    @PUT
    @Path("/{ticketId}/assign")
    public Response assignTicket(@PathParam("ticketId") Long ticketId, @QueryParam("username") String username) {
        ticketService.assignTicket(ticketId, username);
        return Response.status(Response.Status.NO_CONTENT).build();
    }

    @PUT
    @Path("/{ticketId}/unassign")
    public Response unassignTicket(@PathParam("ticketId") Long ticketId) {
        ticketService.unassignTicket(ticketId);
        return Response.status(Response.Status.NO_CONTENT).build();
    }

    @POST
    @Path("/{ticketId}/comments")
    public CommentResponseDTO createComment(@PathParam("ticketId") Long ticketId, CommentRequestDTO commentDTO) {
        return ticketService.createComment(ticketId, commentDTO);
    }

    @GET
    @Path("/{ticketId}/comments")
    public List<CommentResponseDTO> getAllComments(@PathParam("ticketId") Long ticketId) {
        return ticketService.getAllComments(ticketId);
    }

    @DELETE
    @Path("/{ticketId}/comments/{commentId}")
    public Response deleteComment(@PathParam("ticketId") Long ticketId, @PathParam("commentId") Long commentId) {
        ticketService.deleteComment(ticketId, commentId);
        return Response.noContent().build();
    }

    @POST
    @Path("/{ticketId}/acceptance-criteria")
    public AcceptanceCriteriaResponseDTO addAcceptanceCriteria(
            @PathParam("ticketId") Long ticketId,
            AcceptanceCriteriaRequestDTO request) {
        AcceptanceCriteriaResponseDTO response = ticketService.addAcceptanceCriteria(ticketId, request);
        return response;
    }

    @GET
    @Path("/{ticketId}/acceptance-criteria")
    public List<AcceptanceCriteriaResponseDTO> getAllAcceptanceCriteria(
            @PathParam("ticketId") Long ticketId) {
        List<AcceptanceCriteriaResponseDTO> criteriaList = ticketService.getAllAcceptanceCriteria(ticketId);
        return criteriaList;
    }

    @PUT
    @Path("/{ticketId}/acceptance-criteria/{criteriaId}")
    public AcceptanceCriteriaResponseDTO updateAcceptanceCriteria(
            @PathParam("ticketId") Long ticketId,
            @PathParam("criteriaId") Long criteriaId,
            AcceptanceCriteriaRequestDTO request) {
        return ticketService.updateAcceptanceCriteria(ticketId, criteriaId, request);
    }

    @DELETE
    @Path("/{ticketId}/acceptance-criteria/{criteriaId}")
    public Response deleteAcceptanceCriteria(
            @PathParam("ticketId") Long ticketId,
            @PathParam("criteriaId") Long criteriaId) {
        ticketService.deleteAcceptanceCriteria(ticketId, criteriaId);
        return Response.noContent().build();
    }

    @PUT
    @Path("/{ticketId}/related/{relatedTicketId}")
    public Response AddRelatedTicket(
            @PathParam("ticketId") Long ticketId,
            @PathParam("relatedTicketId") Long relatedTicketId) {
        ticketService.addRelatedTicket(ticketId, relatedTicketId);
        return Response.status(Response.Status.NO_CONTENT).build();
    }

    @DELETE
    @Path("/{ticketId}/related/{relatedTicketId}")
    public Response removeRelatedTicket(
            @PathParam("ticketId") Long ticketId,
            @PathParam("relatedTicketId") Long relatedTicketId) {
        ticketService.removeRelatedTicket(ticketId, relatedTicketId);
        return Response.status(Response.Status.NO_CONTENT).build();
    }

    @PUT
    @Path("/{ticketId}/block/{blockedTicketId}")
    public Response addBlockingTicket(
            @PathParam("ticketId") Long ticketId,
            @PathParam("blockedTicketId") Long blockedTicketId) {
        ticketService.addBlockingTicket(ticketId, blockedTicketId);
        return Response.status(Response.Status.NO_CONTENT).build();
    }

    @DELETE
    @Path("/{ticketId}/block/{blockedTicketId}")
    public Response removeBlockingTicket(
            @PathParam("ticketId") Long ticketId,
            @PathParam("blockedTicketId") Long blockedTicketId) {
        ticketService.removeBlockingTicket(ticketId, blockedTicketId);
        return Response.status(Response.Status.NO_CONTENT).build();
    }
}
