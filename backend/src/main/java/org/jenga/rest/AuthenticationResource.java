package org.jenga.rest;

import org.jenga.service.AuthenticationService;
import org.jenga.dto.LoginRequestDTO;
import org.jenga.dto.LoginResponseDTO;
import org.jenga.dto.RegisterRequestDTO;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor(onConstructor_ = {@Inject})
public class AuthenticationResource {

    private final AuthenticationService authenticationService;

    @POST
    @Path("/register")
    public LoginResponseDTO register(RegisterRequestDTO registerRequest) {
        return authenticationService.register(registerRequest);
    }

    @POST
    @Path("/login")
    public LoginResponseDTO login(LoginRequestDTO loginRequest) {
        try {
            return authenticationService.login(loginRequest);
        } catch (Exception e) {
            throw new WebApplicationException("Invalid username or password", Response.Status.BAD_REQUEST);
        }
    }
}
