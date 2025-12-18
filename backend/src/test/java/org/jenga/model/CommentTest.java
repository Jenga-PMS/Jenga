package org.jenga.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Comment Model Tests")
class CommentTest {

    private Comment comment;
    private Ticket ticket;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUsername("testuser");
        user.setEmail("test@example.com");

        ticket = new Ticket();
        ticket.setId(1L);
        ticket.setTitle("Test Ticket");

        comment = new Comment();
    }

    @Test
    @DisplayName("Should create comment with all properties")
    void shouldCreateCommentWithAllProperties() {
        // Given
        comment.setId(1L);
        comment.setTicket(ticket);
        comment.setAuthor(user);
        comment.setComment("This is a test comment");
        
        // Then
        assertThat(comment.getId()).isEqualTo(1L);
        assertThat(comment.getTicket()).isEqualTo(ticket);
        assertThat(comment.getAuthor()).isEqualTo(user);
        assertThat(comment.getComment()).isEqualTo("This is a test comment");
    }

    @Test
    @DisplayName("Should set create date on persist")
    void shouldSetCreateDateOnPersist() {
        // When
        comment.onCreate();
        
        // Then
        assertThat(comment.getCreateDate()).isNotNull();
        assertThat(comment.getModifyDate()).isNotNull();
        assertThat(comment.getCreateDate()).isEqualTo(comment.getModifyDate());
    }

    @Test
    @DisplayName("Should update modify date on update")
    void shouldUpdateModifyDateOnUpdate() throws InterruptedException {
        // Given
        comment.onCreate();
        LocalDateTime originalModifyDate = comment.getModifyDate();
        
        // Wait a bit to ensure time difference
        Thread.sleep(10);
        
        // When
        comment.onUpdate();
        
        // Then
        assertThat(comment.getModifyDate()).isAfter(originalModifyDate);
        assertThat(comment.getCreateDate()).isEqualTo(originalModifyDate);
    }

    @Test
    @DisplayName("Should support no-args constructor")
    void shouldSupportNoArgsConstructor() {
        // When
        Comment emptyComment = new Comment();
        
        // Then
        assertThat(emptyComment).isNotNull();
        assertThat(emptyComment.getId()).isNull();
        assertThat(emptyComment.getComment()).isNull();
    }

    @Test
    @DisplayName("Should support all-args constructor")
    void shouldSupportAllArgsConstructor() {
        // Given
        LocalDateTime now = LocalDateTime.now();
        
        // When
        Comment fullComment = new Comment(1L, ticket, user, "Test comment", now, now);
        
        // Then
        assertThat(fullComment.getId()).isEqualTo(1L);
        assertThat(fullComment.getTicket()).isEqualTo(ticket);
        assertThat(fullComment.getAuthor()).isEqualTo(user);
        assertThat(fullComment.getComment()).isEqualTo("Test comment");
        assertThat(fullComment.getCreateDate()).isEqualTo(now);
        assertThat(fullComment.getModifyDate()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should handle null relationships")
    void shouldHandleNullRelationships() {
        // When
        comment.setTicket(null);
        comment.setAuthor(null);
        
        // Then
        assertThat(comment.getTicket()).isNull();
        assertThat(comment.getAuthor()).isNull();
    }
}
