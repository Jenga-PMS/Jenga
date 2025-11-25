package org.jenga.service.MCP_Server;

import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.store.memory.chat.ChatMemoryStore;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class InMemoryChatMemoryStore implements ChatMemoryStore {

    private final Map<Object, List<ChatMessage>> messagesByMemoryId = new ConcurrentHashMap<>();

    @Override
    public List<ChatMessage> getMessages(Object memoryId) {
        return new ArrayList<>(messagesByMemoryId.getOrDefault(memoryId, new ArrayList<>()));
    }

    @Override
    public void updateMessages(Object memoryId, List<ChatMessage> messages) {
        messagesByMemoryId.put(memoryId, new ArrayList<>(messages));
    }

    @Override
    public void deleteMessages(Object memoryId) {
        // Not deleting anything as of now, i think qarkus dev is reloading the backend and clearing the chat
    }
}