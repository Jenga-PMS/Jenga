package org.jenga.service;

import java.util.List;
import java.util.stream.Collectors;

import org.jenga.db.UserRepository;
import org.jenga.model.User;
import org.jenga.dto.UserDTO;
import org.jenga.mapper.UserMapper;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

@ApplicationScoped
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Inject
    public UserService(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper= userMapper;
    }

    @Transactional
    public UserDTO findByUsername(String username) {
        username = username.toLowerCase();
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new NotFoundException("User not found with username: " + username);
        }
        return userMapper.userToUserDTO(user);
    }

    @Transactional
    public List<UserDTO> searchUsers(String usernamePart) {
        List<User> users = userRepository.searchByUsernameStartsWith(usernamePart.toLowerCase());
        return users.stream().map(userMapper::userToUserDTO).collect(Collectors.toList());
    }

    @Transactional
    public List<UserDTO> findAll() {
        List<User> users = userRepository.findAll().list(); 
        return users.stream()
                    .map(userMapper::userToUserDTO)
                    .collect(Collectors.toList());
    }
}
