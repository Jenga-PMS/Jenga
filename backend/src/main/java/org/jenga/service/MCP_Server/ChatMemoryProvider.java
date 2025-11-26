package org.jenga.service.MCP_Server;

import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.RequiredArgsConstructor;

import java.util.function.Supplier;

@ApplicationScoped
@RequiredArgsConstructor(onConstructor_ = {@Inject})
public class ChatMemoryProvider implements Supplier<ChatMemory> {

    private final InMemoryChatMemoryStore store;

    @Override
    public ChatMemory get() {
        return MessageWindowChatMemory.builder()
                .maxMessages(10)
                .chatMemoryStore(store)
                .build();
    }
}