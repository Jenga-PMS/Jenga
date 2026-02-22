import {
    Accessor,
    createContext,
    createEffect,
    createResource,
    createSignal,
    JSXElement,
    Setter,
    useContext
} from "solid-js";
import { ProjectContext } from "./ProjectProvider";
import { UserContext } from "./UserProvider";
import { AiResourceService } from "../api";  // openapi-typescript-codegen barrel export
import { AuthContext } from "./AuthProvider";

type AiContextType = {
    sessionId: Accessor<string | undefined>;
    setSessionId: Setter<string | undefined>;

    messages: Accessor<string[] | undefined>;
    setMessages: Setter<string[] | undefined>;

    sendMessage: (message: string) => void;
};

export const AiContext = createContext<AiContextType>();

interface ProviderProps {
    children: JSXElement;
}

export const AiProvider = (props: ProviderProps) => {
    const aCtx = useContext(AuthContext);
    const uCtx = useContext(UserContext);
    const pCtx = useContext(ProjectContext);

    const [sessionId, setSessionId] = createSignal<string>();
    const [messages, setMessages] = createSignal<string[]>();

    // { text, nonce } so that sending the same message twice still triggers a fetch
    // (SolidJS createResource won't re-run if the source value is identical)
    const [pending, setPending] = createSignal<{ text: string; nonce: number } | undefined>();

    // ── API call ──────────────────────────────────────────────────────────────
    // openapi-typescript-codegen generates AiResourceService.postApiAiChat()
    // which takes a flat requestBody object and returns the DTO directly —
    // NOT wrapped in an axios { data } envelope.
    // ─────────────────────────────────────────────────────────────────────────
    const [response] = createResource(pending, async (p) => {
        console.debug("[AiProvider] calling postApiAiChat:", {
            message: p.text,
            conversationId: sessionId(),
            currentUser: uCtx?.user()?.username,
        });

        // postApiAiChat expects: { requestBody: ChatRequestDTO }
        const result = await AiResourceService.postApiAiChat({
            requestBody: {
                message: p.text,
                conversationId: sessionId(),
                currentUser: uCtx?.user()?.username ?? "unknown",
                currentProjectID: pCtx?.selectedTicket()?.id ?? 0,
                currentTicketID: pCtx?.selectedTicket()?.id ?? 0,
            }
        });

        console.debug("[AiProvider] postApiAiChat result:", result);
        return result; // already ChatResponseDTO, no .data needed
    });

    // ── Handle AI response ────────────────────────────────────────────────────
    createEffect(() => {
        if (response.error) {
            console.error("[AiProvider] API error:", response.error);
            setMessages(prev => [
                ...(prev ?? []),
                "Sorry, something went wrong. Please try again."
            ]);
            setPending(undefined);
            return;
        }

        const res = response();
        if (!res) return;

        console.debug("[AiProvider] AI reply:", res.response);
        setSessionId(res.conversationId);
        setMessages(prev => [...(prev ?? []), res.response ?? ""]);
        setPending(undefined);
    });

    // ── Debug ─────────────────────────────────────────────────────────────────
    createEffect(() => {
        console.debug("[AiProvider] messages updated:", messages());
    });

    // ── Public API ────────────────────────────────────────────────────────────
    // NOTE: We append the user message here immediately (optimistic),
    // so chat.tsx can detect the AI reply by watching for the next append.
    const sendMessage = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        setMessages(prev => [...(prev ?? []), trimmed]);
        setPending({ text: trimmed, nonce: Date.now() });
    };

    const value: AiContextType = {
        sessionId,
        setSessionId,
        messages,
        setMessages,
        sendMessage,
    };

    return <AiContext.Provider value={value}>{props.children}</AiContext.Provider>;
};