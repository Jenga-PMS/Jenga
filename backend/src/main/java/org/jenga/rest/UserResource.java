package org.jenga.rest;

import java.util.List;

import org.jenga.service.UserService;
import org.jenga.dto.UserDTO;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;

@Path("/api/users")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor(onConstructor_ = {@Inject})
public class UserResource {

    private final UserService userService;

    @GET
    @Path("/{username}")
    public UserDTO getUserByUsername(@PathParam("username") String username) {
        return userService.findByUsername(username);
    }

    @GET
    @Path("/search")
    public List<UserDTO> searchUsers(@QueryParam("username") String usernamePart) {
        if (usernamePart == null || usernamePart.trim().isEmpty()) {
            throw new BadRequestException("Username must be provided");
        }
        return userService.searchUsers(usernamePart);
    }
}
