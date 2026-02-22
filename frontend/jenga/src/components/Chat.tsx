import {
  Alert, Button, Card, CardActions, CardContent, CardHeader,
  Dialog, DialogContent, Stack, TextField, Typography
} from "@suid/material"
import { createEffect, createSignal, For, on, Show, useContext } from "solid-js"
import { AuthContext } from "../provider/AuthProvider"
import { LayoutContext } from "../provider/LayoutProvider"
import { AiContext } from "../provider/AiProvider"

// ─── Types ────────────────────────────────────────────────────────────────────

type ChatSession = {
  id: number;
  title: string;
  messages: string[]; // alternating: user, ai, user, ai ...
};

// ─── Speech Bubble Styles ─────────────────────────────────────────────────────

const bubbleStyles = `
  .bubble-user::before {
    content: '';
    position: absolute;
    right: -8px;
    bottom: 10px;
    border-width: 8px 0 8px 10px;
    border-style: solid;
    border-color: transparent transparent transparent #1976d2;
  }
  .bubble-ai::before {
    content: '';
    position: absolute;
    left: -8px;
    bottom: 10px;
    border-width: 8px 10px 8px 0;
    border-style: solid;
    border-color: transparent #e8e8e8 transparent transparent;
  }
  .bubble-thinking {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 4px 0;
  }
  .bubble-thinking span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #999;
    animation: bounce 1.2s infinite ease-in-out;
  }
  .bubble-thinking span:nth-child(2) { animation-delay: 0.2s; }
  .bubble-thinking span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-6px); }
  }
`;

if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.textContent = bubbleStyles;
  document.head.appendChild(styleTag);
}

// ─── Chat Button ──────────────────────────────────────────────────────────────

export const ChatButton = () => {
  const layoutCtx = useContext(LayoutContext);
  return (
    <Button variant="contained" onClick={() => layoutCtx?.setOpenChat(true)}>
      AI
    </Button>
  );
};

// ─── Chat Panel ───────────────────────────────────────────────────────────────

type ChatPanelProps = {
  session: ChatSession;
  onSendMessage: (text: string) => void;
  isWaiting: boolean;
};

const ChatPanel = (props: ChatPanelProps) => {
  const aCtx = useContext(AuthContext);
  const [message, setMessage] = createSignal("");
  const [showError, setShowError] = createSignal(false);
  let messagesEndRef: HTMLDivElement | undefined;

  createEffect(() => {
    void props.session.messages.length;
    void props.isWaiting;
    messagesEndRef?.scrollIntoView({ behavior: "smooth" });
  });

  const handleSend = () => {
    const text = message().trim();
    if (!text) return;
    if (aCtx?.isLoggedIn?.()) {
      setShowError(false);
      props.onSendMessage(text);
      setMessage("");
    } else {
      setShowError(true);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card sx={{ flex: 1, display: "flex", flexDirection: "column", boxShadow: "none", borderRadius: 0 }}>
      <CardHeader
        title={props.session.title}
        sx={{ borderBottom: "1px solid #eee", paddingY: "12px" }}
      />

      <CardContent sx={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "16px",
        backgroundColor: "#f9f9f9"
      }}>
        <For each={props.session.messages}>
          {(msg, i) => {
            const isUser = () => i() % 2 === 0;
            return (
              <Stack direction="row" justifyContent={isUser() ? "flex-end" : "flex-start"}>
                <div
                  class={isUser() ? "bubble-user" : "bubble-ai"}
                  style={{
                    position: "relative",
                    "max-width": "65%",
                    padding: "10px 14px",
                    "border-radius": isUser() ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    "background-color": isUser() ? "#1976d2" : "#e8e8e8",
                    color: isUser() ? "#fff" : "#111",
                    "font-size": "0.92rem",
                    "line-height": "1.5",
                    "word-break": "break-word",
                    "white-space": "pre-wrap",
                    "box-shadow": "0 1px 3px rgba(0,0,0,0.12)"
                  }}
                >
                  <Typography variant="caption" sx={{ display: "block", fontWeight: 700, marginBottom: "2px", opacity: 0.75 }}>
                    {isUser() ? "You" : "AI"}
                  </Typography>
                  {msg}
                </div>
              </Stack>
            );
          }}
        </For>

        <Show when={props.isWaiting}>
          <Stack direction="row" justifyContent="flex-start">
            <div
              class="bubble-ai"
              style={{
                position: "relative",
                padding: "10px 14px",
                "border-radius": "18px 18px 18px 4px",
                "background-color": "#e8e8e8",
                "box-shadow": "0 1px 3px rgba(0,0,0,0.12)"
              }}
            >
              <Typography variant="caption" sx={{ display: "block", fontWeight: 700, marginBottom: "2px", opacity: 0.75 }}>
                AI
              </Typography>
              <div class="bubble-thinking">
                <span /><span /><span />
              </div>
            </div>
          </Stack>
        </Show>

        <Show when={props.session.messages.length === 0 && !props.isWaiting}>
          <Typography sx={{ color: "#aaa", textAlign: "center", marginTop: "40px" }}>
            Start a conversation…
          </Typography>
        </Show>

        <div ref={messagesEndRef} />
      </CardContent>

      <CardActions sx={{ padding: "12px", borderTop: "1px solid #eee", gap: "8px", alignItems: "flex-start", flexWrap: "wrap" }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={message()}
          onChange={(_, value) => setMessage(value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the AI for help…"
          size="small"
          disabled={props.isWaiting}
        />
        <Button variant="contained" onClick={handleSend} disabled={props.isWaiting} sx={{ flexShrink: 0 }}>
          Send
        </Button>
        <Show when={showError()}>
          <Alert severity="error" sx={{ width: "100%" }}>
            You must be logged in to use AI chat.
          </Alert>
        </Show>
      </CardActions>
    </Card>
  );
};

// ─── Session Sidebar ──────────────────────────────────────────────────────────

type SidebarProps = {
  sessions: ChatSession[];
  activeId: number;
  onSelect: (id: number) => void;
  onNew: () => void;
};

const SessionSidebar = (props: SidebarProps) => (
  <Stack sx={{
    width: "200px",
    minWidth: "200px",
    borderRight: "1px solid #e0e0e0",
    padding: "12px 8px",
    gap: "6px",
    backgroundColor: "#fafafa",
    overflowY: "auto"
  }}>
    <Button variant="contained" size="small" onClick={props.onNew} sx={{ marginBottom: "8px" }}>
      + New Chat
    </Button>
    <For each={props.sessions}>
      {(session) => (
        <Button
          onClick={() => props.onSelect(session.id)}
          variant={props.activeId === session.id ? "contained" : "text"}
          color={props.activeId === session.id ? "primary" : "inherit"}
          size="small"
          sx={{
            justifyContent: "flex-start",
            textTransform: "none",
            fontWeight: props.activeId === session.id ? 700 : 400,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {session.title}
        </Button>
      )}
    </For>
  </Stack>
);

// ─── Chat Dialog ──────────────────────────────────────────────────────────────

export const ChatDialog = () => {
  const layoutCtx = useContext(LayoutContext);
  const aiContext = useContext(AiContext);

  const [sessions, setSessions] = createSignal<ChatSession[]>([
    { id: 1, title: "Chat 1", messages: [] }
  ]);
  const [activeId, setActiveId] = createSignal(1);
  const [isWaiting, setIsWaiting] = createSignal(false);

  const activeSession = () => sessions().find(s => s.id === activeId())!;

  // ── Detect AI replies from AiContext ──────────────────────────────────────
  //
  // Flow:
  //   1. User clicks Send in chat.tsx → handleSendMessage adds user msg locally
  //      and calls aiContext.sendMessage(text)
  //   2. AiProvider.sendMessage also appends user msg to aiContext.messages
  //      → effect fires: array grew by 1, new item === lastLocal → SKIP (user echo)
  //   3. API responds → AiProvider appends AI reply to aiContext.messages
  //      → effect fires: array grew by 1, new item !== lastLocal → APPEND to session
  // ─────────────────────────────────────────────────────────────────────────
  createEffect(
    on(
      () => aiContext?.messages(),
      (msgs, prevMsgs) => {
        if (!msgs || !prevMsgs) return;
        if (msgs.length !== prevMsgs.length + 1) return;
        if (!isWaiting()) return;

        const newItem = msgs[msgs.length - 1];
        const session = sessions().find(s => s.id === activeId());
        const lastLocal = session?.messages[session.messages.length - 1];

        // Skip the user-message echo that AiProvider adds in sendMessage()
        if (newItem === lastLocal) {
          console.debug("[Chat] skipping user echo");
          return;
        }

        // It's the real AI reply — append to active session and clear spinner
        console.debug("[Chat] AI reply received:", newItem);
        setSessions(prev =>
          prev.map(s =>
            s.id === activeId()
              ? { ...s, messages: [...s.messages, newItem] }
              : s
          )
        );
        setIsWaiting(false);
      },
      { defer: true }
    )
  );

  const handleSelectSession = (id: number) => {
    setActiveId(id);
    const target = sessions().find(s => s.id === id);
    // Restore this session's history into AiContext so the backend has context
    aiContext?.setMessages(target?.messages.length ? [...target.messages] : undefined);
    setIsWaiting(false);
  };

  const handleNewChat = () => {
    const id = Date.now();
    setSessions(prev => [...prev, { id, title: `Chat ${prev.length + 1}`, messages: [] }]);
    handleSelectSession(id);
  };

  const handleSendMessage = (text: string) => {
    console.debug("[Chat] sending:", text);

    // 1. Add user message locally immediately (optimistic)
    setSessions(prev =>
      prev.map(s =>
        s.id === activeId()
          ? { ...s, messages: [...s.messages, text] }
          : s
      )
    );

    // 2. Show typing indicator
    setIsWaiting(true);

    // 3. Call real backend via AiContext
    aiContext?.sendMessage(text);
  };

  return (
    <Dialog
      open={layoutCtx?.openChat() ?? false}
      onClose={() => layoutCtx?.setOpenChat(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { height: "75vh", display: "flex", flexDirection: "column" } }}
    >
      <DialogContent sx={{ display: "flex", padding: 0, overflow: "hidden" }}>
        <SessionSidebar
          sessions={sessions()}
          activeId={activeId()}
          onSelect={handleSelectSession}
          onNew={handleNewChat}
        />
        <ChatPanel
          session={activeSession()}
          onSendMessage={handleSendMessage}
          isWaiting={isWaiting()}
        />
      </DialogContent>
    </Dialog>
  );
};