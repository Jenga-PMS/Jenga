package org.jenga.service;

import org.jenga.model.User;
import org.jenga.db.UserRepository;
import org.jenga.dto.RegisterRequestDTO;
import org.jenga.dto.LoginRequestDTO;
import org.jenga.dto.LoginResponseDTO;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.SecurityContext;
import lombok.RequiredArgsConstructor;

import javax.security.auth.login.LoginException;
import jakarta.ws.rs.BadRequestException;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.smallrye.jwt.build.Jwt;

@ApplicationScoped
@RequiredArgsConstructor(onConstructor_ = {@Inject})
public class AuthenticationService {

    private static final int EXPIRATION_TIME_SECONDS = 3600;

    private final UserRepository userRepository;

    @Context
    SecurityContext securityContext;

    @Transactional
    public LoginResponseDTO register(RegisterRequestDTO registerRequest) {
        String username = registerRequest.getUsername().toLowerCase();

        User existingUser = userRepository.findByUsername(username);
        if (existingUser != null) {
            throw new BadRequestException("User already exists");
        }

        if (username == null || username.isEmpty()) {
            throw new BadRequestException("Username cannot be empty");
        }

        if (username.contains(" ")) {
            throw new BadRequestException("Username cannot contain spaces");
        }

        if (!username.matches("[a-zA-Z0-9]+")) {
            throw new BadRequestException("Username must only contain letters and numbers");
        }

        String email = registerRequest.getEmail();
        String hashedPassword = BcryptUtil.bcryptHash(registerRequest.getPassword());
        User user = new User(username, email, hashedPassword, null, null);
        userRepository.persist(user);

        LoginResponseDTO loginResponse = new LoginResponseDTO();
        loginResponse.setUsername(username);
        loginResponse.setToken(generateToken(user));
        loginResponse.setExpiresIn(EXPIRATION_TIME_SECONDS);

        return loginResponse;
    }

    public LoginResponseDTO login(LoginRequestDTO loginRequest) throws LoginException {
        User user = userRepository.findByUsername(loginRequest.getUsername().toLowerCase());

        if (user == null) {
            throw new BadRequestException("Invalid username or password");
        }

        if (!BcryptUtil.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid username or password");
        }

        LoginResponseDTO loginResponse = new LoginResponseDTO();
        loginResponse.setUsername(user.getUsername());
        loginResponse.setToken(generateToken(user));
        loginResponse.setExpiresIn(EXPIRATION_TIME_SECONDS);

        return loginResponse;
    }

    public String generateToken(User user) {
        long expirationTime = (System.currentTimeMillis() / 1000L) + EXPIRATION_TIME_SECONDS;

        return Jwt.issuer("jenga")
                  .upn(user.getUsername())
                  .expiresAt(expirationTime)
                  .sign();
    }

    public User getCurrentUser() {
        String username = securityContext.getUserPrincipal().getName();

        User currentUser = userRepository.findByUsername(username);

        if (currentUser == null) {
            throw new RuntimeException("Failed to get user from security context: " + username);
        }

        return currentUser;
    }
}
