"use client";

import { useEffect, useRef, useState } from "react";

const DISMISSED_KEY = "shopi_chat_dismissed";

type Message = {
  id: number;
  from: "user" | "support";
  text: string;
  time: string;
};

function now() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const GREETING: Message = {
  id: 0,
  from: "support",
  text: "Hi there 👋 I'm Amina from the Shopi support team. How can I help you today?",
  time: now(),
};

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // On mount, check sessionStorage — if dismissed this session, keep panel closed

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function handleDismiss() {
    setOpen(false);
    setDismissed(true);
    sessionStorage.setItem(DISMISSED_KEY, "1");
  }

  function handleOpen() {
    // Reopen clears the dismissed state for this session
    setDismissed(false);
    sessionStorage.removeItem(DISMISSED_KEY);
    setOpen(true);
  }

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = {
      id: Date.now(),
      from: "user",
      text,
      time: now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    // Simulate support "typing" — in production this is replaced by a WebSocket/real-time event
    setTimeout(() => {
      setTyping(false);
      const reply: Message = {
        id: Date.now() + 1,
        from: "support",
        text: "Thanks for reaching out! Our team has received your message and will reply shortly.",
        time: now(),
      };
      setMessages((prev) => [...prev, reply]);
    }, 2000);
  }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] max-w-sm z-50 flex flex-col rounded-2xl overflow-hidden"
          style={{
            boxShadow: "var(--shadow-lg)",
            border: "1px solid rgb(var(--color-border))",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{
              background:
                "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-accent)))",
            }}
          >
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-md">
                A
              </div>
              {/* Online dot */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-(length:--text-sm) leading-tight">
                Amina · Shopi Support
              </p>
              <p className="text-white/70 text-(length:--text-xs)">
                Usually replies in a few minutes
              </p>
            </div>
            <button
              onClick={handleDismiss}
              aria-label="Close chat"
              className="text-white/70 hover:text-white transition-colors p-1 rounded"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3"
            style={{
              background: "rgb(var(--color-bg))",
              minHeight: 360,
              maxHeight: 480,
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.from === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-2xl text-(length:--text-sm) leading-normal max-w-[80%] ${
                    msg.from === "user"
                      ? "text-white rounded-br-sm"
                      : "text-foreground rounded-bl-sm"
                  }`}
                  style={
                    msg.from === "user"
                      ? { background: "rgb(var(--brand-primary))" }
                      : {
                          background: "rgb(var(--color-bg-subtle))",
                          border: "1px solid rgb(var(--color-border))",
                        }
                  }
                >
                  {msg.text}
                </div>
                <span className="text-(length:--text-xs) text-muted mt-1">
                  {msg.time}
                </span>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex items-start">
                <div
                  className="px-3 py-2 rounded-2xl rounded-bl-sm flex gap-1 items-center"
                  style={{
                    background: "rgb(var(--color-bg-subtle))",
                    border: "1px solid rgb(var(--color-border))",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="flex items-center gap-2 px-3 py-3 border-t border-default"
            style={{ background: "rgb(var(--color-bg))" }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message…"
              className="flex-1 bg-surface rounded-full px-4 py-2 text-(length:--text-sm) text-foreground placeholder:text-muted outline-none border border-default focus:border-accent transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              aria-label="Send message"
              className="w-9 h-9 rounded-full flex items-center justify-center text-white disabled:opacity-40 transition-opacity shrink-0"
              style={{ background: "rgb(var(--brand-primary))" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Bubble — always visible */}
      <button
        onClick={open ? () => setOpen(false) : handleOpen}
        aria-label={open ? "Minimize chat" : "Chat with support"}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95"
        style={{
          background:
            "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-accent)))",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {open ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        ) : (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}

        {/* Unread dot — shows when panel is closed and not dismissed */}
        {!open && !dismissed && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>
    </>
  );
}
