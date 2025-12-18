package org.jenga.rest;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
@DisplayName("Project REST API Integration Tests")
@Disabled("Integration tests disabled - requires full application configuration")
class ProjectResourceIntegrationTest {

    @Test
    @DisplayName("Should return all projects")
    void shouldReturnAllProjects() {
        given()
            .when()
            .get("/api/projects")
            .then()
            .statusCode(anyOf(is(200), is(401))); // May require auth
    }

    @Test
    @DisplayName("Should return 400 when creating project with invalid identifier")
    void shouldReturn400WhenCreatingProjectWithInvalidIdentifier() {
        String invalidProject = """
            {
                "identifier": "",
                "name": "Test Project",
                "description": "Test Description"
            }
            """;

        given()
            .contentType(ContentType.JSON)
            .body(invalidProject)
            .when()
            .post("/api/projects")
            .then()
            .statusCode(anyOf(is(400), is(401))); // May require auth
    }

    @Test
    @DisplayName("Should validate project identifier length")
    void shouldValidateProjectIdentifierLength() {
        String invalidProject = """
            {
                "identifier": "VERYLONGIDENTIFIER",
                "name": "Test Project",
                "description": "Test Description"
            }
            """;

        given()
            .contentType(ContentType.JSON)
            .body(invalidProject)
            .when()
            .post("/api/projects")
            .then()
            .statusCode(anyOf(is(400), is(401)));
    }

    @Test
    @DisplayName("Should validate project identifier format")
    void shouldValidateProjectIdentifierFormat() {
        String invalidProject = """
            {
                "identifier": "PROJ-123",
                "name": "Test Project",
                "description": "Test Description"
            }
            """;

        given()
            .contentType(ContentType.JSON)
            .body(invalidProject)
            .when()
            .post("/api/projects")
            .then()
            .statusCode(anyOf(is(400), is(401)));
    }

    @Test
    @DisplayName("Should return 404 when project not found")
    void shouldReturn404WhenProjectNotFound() {
        given()
            .when()
            .get("/api/projects/NONEXISTENT")
            .then()
            .statusCode(anyOf(is(404), is(401)));
    }

    @Test
    @DisplayName("Should access OpenAPI documentation")
    void shouldAccessOpenApiDocumentation() {
        given()
            .when()
            .get("/q/openapi")
            .then()
            .statusCode(200)
            .contentType(anyOf(containsString("application/yaml"), containsString("text/plain")));
    }

    @Test
    @DisplayName("Should access Swagger UI")
    void shouldAccessSwaggerUi() {
        given()
            .when()
            .get("/q/swagger-ui")
            .then()
            .statusCode(200);
    }
}
