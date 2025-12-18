package org.jenga.service;

import org.jenga.db.UserRepository;
import org.jenga.dto.UserDTO;
import org.jenga.mapper.UserMapper;
import org.jenga.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import jakarta.ws.rs.NotFoundException;
import io.quarkus.hibernate.orm.panache.PanacheQuery;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PanacheQuery<User> panacheQuery;

    @InjectMocks
    private UserService userService;

    private User user;
    private UserDTO userDTO;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setPassword("hashedpassword");
        user.setCreateDate(LocalDateTime.now());
        user.setModifyDate(LocalDateTime.now());

        userDTO = new UserDTO();
        userDTO.setUsername("testuser");
        userDTO.setEmail("test@example.com");
    }

    @Test
    @DisplayName("Should find user by username")
    void shouldFindUserByUsername() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(user);
        when(userMapper.userToUserDTO(user)).thenReturn(userDTO);

        // When
        UserDTO result = userService.findByUsername("testuser");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("testuser");
        assertThat(result.getEmail()).isEqualTo("test@example.com");
        verify(userRepository).findByUsername("testuser");
        verify(userMapper).userToUserDTO(user);
    }

    @Test
    @DisplayName("Should convert username to lowercase when finding")
    void shouldConvertUsernameToLowercase() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(user);
        when(userMapper.userToUserDTO(user)).thenReturn(userDTO);

        // When
        UserDTO result = userService.findByUsername("TESTUSER");

        // Then
        assertThat(result).isNotNull();
        verify(userRepository).findByUsername("testuser");
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void shouldThrowExceptionWhenUserNotFound() {
        // Given
        when(userRepository.findByUsername("nonexistent")).thenReturn(null);

        // When/Then
        assertThatThrownBy(() -> userService.findByUsername("nonexistent"))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("User not found");
        
        verify(userMapper, never()).userToUserDTO(any(User.class));
    }

    @Test
    @DisplayName("Should search users by username part")
    void shouldSearchUsersByUsernamePart() {
        // Given
        User user2 = new User();
        user2.setUsername("testuser2");
        user2.setEmail("test2@example.com");
        
        UserDTO userDTO2 = new UserDTO();
        userDTO2.setUsername("testuser2");
        userDTO2.setEmail("test2@example.com");
        
        when(userRepository.searchByUsernameStartsWith("test")).thenReturn(Arrays.asList(user, user2));
        when(userMapper.userToUserDTO(user)).thenReturn(userDTO);
        when(userMapper.userToUserDTO(user2)).thenReturn(userDTO2);

        // When
        List<UserDTO> result = userService.searchUsers("test");

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).extracting(UserDTO::getUsername)
                .containsExactly("testuser", "testuser2");
        verify(userRepository).searchByUsernameStartsWith("test");
    }

    @Test
    @DisplayName("Should convert search term to lowercase")
    void shouldConvertSearchTermToLowercase() {
        // Given
        when(userRepository.searchByUsernameStartsWith("test")).thenReturn(Arrays.asList(user));
        when(userMapper.userToUserDTO(user)).thenReturn(userDTO);

        // When
        userService.searchUsers("TEST");

        // Then
        verify(userRepository).searchByUsernameStartsWith("test");
    }

    @Test
    @DisplayName("Should return empty list when no users match search")
    void shouldReturnEmptyListWhenNoUsersMatch() {
        // Given
        when(userRepository.searchByUsernameStartsWith("xyz")).thenReturn(Arrays.asList());

        // When
        List<UserDTO> result = userService.searchUsers("xyz");

        // Then
        assertThat(result).isEmpty();
        verify(userRepository).searchByUsernameStartsWith("xyz");
    }

    @Test
    @DisplayName("Should find all users")
    void shouldFindAllUsers() {
        // Given
        User user2 = new User();
        user2.setUsername("user2");
        user2.setEmail("user2@example.com");
        
        UserDTO userDTO2 = new UserDTO();
        userDTO2.setUsername("user2");
        userDTO2.setEmail("user2@example.com");
        
        when(userRepository.findAll()).thenReturn(panacheQuery);
        when(panacheQuery.list()).thenReturn(Arrays.asList(user, user2));
        when(userMapper.userToUserDTO(user)).thenReturn(userDTO);
        when(userMapper.userToUserDTO(user2)).thenReturn(userDTO2);

        // When
        List<UserDTO> result = userService.findAll();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).extracting(UserDTO::getUsername)
                .contains("testuser", "user2");
        verify(userRepository).findAll();
    }
}
