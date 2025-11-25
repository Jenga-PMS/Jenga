package org.jenga.tool;

import dev.langchain4j.agent.tool.Tool;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jenga.dto.UserDTO;
import org.jenga.service.UserService;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class GetAllUsersTool {

    @Inject
    UserService userService;

    @Tool("Get a list of all user usernames in the system.")
    public String getAllUsers() {
        try {
            List<UserDTO> users = userService.findAll();

            if (users == null || users.isEmpty()) {
                return "No users are available in the system.";
            }

            return "Available Users:\n" +
                   users.stream()
                        .map(UserDTO::getUsername)
                        .sorted()
                        .collect(Collectors.joining(", "));

        } catch (Exception e) {
            return "ERROR: An unexpected error occurred while fetching users: " + e.getMessage();
        }
    }
}