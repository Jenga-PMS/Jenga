package org.jenga.tool;

import dev.langchain4j.agent.tool.Tool;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.jenga.service.MCP_Server.GoogleSearchApi;
import org.jenga.dto.MCP_Server.WebSearchResponseDTO;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class WebSearchTool {

    @Inject
    @RestClient
    GoogleSearchApi searchApi;

    @ConfigProperty(name = "google.api.key")
    String apiKey;

    @ConfigProperty(name = "google.cse.id")
    String searchEngineId;

    @Tool("Performs a web search for a given query")
    public List<String> searchWeb(String query) {
        try {
            WebSearchResponseDTO response = searchApi.search(apiKey, searchEngineId, query);

            if (response == null || response.getItems() == null || response.getItems().isEmpty()) {
                return List.of("No results found for: " + query);
            }

            return response.getItems().stream()
                    .map(item -> String.format(
                            "Title: %s\nSnippet: %s\nURL: %s",
                            item.getTitle(),
                            item.getSnippet(),
                            item.getLink()
                    ))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            System.err.println("Error calling search API: " + e.getMessage());
            return List.of("Error performing search: " + e.getMessage());
        }
    }
}