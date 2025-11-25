package org.jenga.service.MCP_Server;

import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.function.Supplier;

@ApplicationScoped
public class ChatMemoryProvider implements Supplier<ChatMemory> {

    @Inject
    InMemoryChatMemoryStore store;

    @Override
    public ChatMemory get() {
        return MessageWindowChatMemory.builder()
                .maxMessages(10)
                .chatMemoryStore(store)
                .build();
    }
}