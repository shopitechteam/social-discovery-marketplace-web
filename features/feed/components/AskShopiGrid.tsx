"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Bot, Search, Send, Sparkles } from "lucide-react";
import { DiscoverGridCard } from "@/features/discover/components/DiscoverGridCard";
import {
  SHOPI_BUYER_TURN,
  toCriteriaInput,
  type BuyerAsk,
  type BuyerCriteria,
  type ShopiBuyerTurnResult,
} from "@/features/feed/graphql/askShopi";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";

type ChatMessage = { id: string; role: "agent" | "user"; text: string };

let msgSeq = 0;
const nextId = () => `am${Date.now().toString(36)}-${(msgSeq += 1)}`;

const GREETING =
  "Hi 👋 I’m Shopi. Tell me what you’re looking for — like “a quarter-acre plot near Nakuru under 200k” — and I’ll find it. No filters, no forms.";

interface Props {
  lang: string;
  active?: boolean;
}

export function AskShopiGrid({ lang, active = true }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: nextId(), role: "agent", text: GREETING },
  ]);
  const [criteria, setCriteria] = useState<BuyerCriteria | undefined>(undefined);
  const [results, setResults] = useState<ContentCardFieldsFragment[]>([]);
  const [ask, setAsk] = useState<BuyerAsk | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [runBuyerTurn, { loading }] = useMutation(SHOPI_BUYER_TURN);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (active) scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, results, loading, active]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = { id: nextId(), role: "user", text };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput("");
    setError(null);

    try {
      const { data } = await runBuyerTurn({
        variables: {
          input: {
            transcript: history.map((m) => ({
              role: m.role === "agent" ? ("AGENT" as const) : ("USER" as const),
              text: m.text,
            })),
            criteria: toCriteriaInput(criteria),
          },
        },
      });

      const turn: ShopiBuyerTurnResult | undefined = data?.shopiBuyerTurn;
      if (!turn) throw new Error("Shopi is unavailable right now");

      setCriteria(turn.criteria);
      setAsk(turn.ask);
      if (turn.message.trim()) {
        setMessages((prev) => [...prev, { id: nextId(), role: "agent", text: turn.message.trim() }]);
      }
      if (turn.readyToSearch) setResults(turn.results.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "agent",
          text: "Sorry — I couldn’t search just now. Mind trying again?",
        },
      ]);
    }
  }

  const placeholder =
    ask?.placeholder || ask?.label || "Ask Shopi to find anything…";

  return (
    <div className="flex min-h-svh flex-col bg-surface">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[820px] flex-col gap-3 px-3 py-4 sm:px-5">
          <div className="rounded-2xl border border-default bg-app p-4">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-semibold">Ask Shopi</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Buying and selling, as a conversation. Shopi understands what you need and
              helps you get exactly that.
            </p>
          </div>

          {messages.map((message) =>
            message.role === "agent" ? (
              <AgentBubble key={message.id}>{message.text}</AgentBubble>
            ) : (
              <UserBubble key={message.id}>{message.text}</UserBubble>
            ),
          )}

          {loading ? (
            <AgentBubble>
              <TypingDots />
            </AgentBubble>
          ) : null}

          {results.length > 0 ? (
            <section className="mt-1">
              <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-default">
                <Search className="h-4 w-4" />
                <span>{results.length} matches</span>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 xl:grid-cols-4">
                {results.map((post, index) => (
                  <DiscoverGridCard key={post.id} post={post} lang={lang} priority={index < 4} />
                ))}
              </div>
            </section>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div ref={scrollAnchorRef} />
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-default bg-app/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[820px] items-end gap-2 px-3 py-3 sm:px-5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            rows={1}
            placeholder={placeholder}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-border bg-surface px-4 py-2.5 text-base text-foreground outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={loading || !input.trim()}
            aria-label="Send"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AgentBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <Bot className="h-4 w-4" />
      </span>
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-app px-3.5 py-2.5 text-sm text-default">
        <p className="whitespace-pre-wrap">{children}</p>
      </div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
        <p className="whitespace-pre-wrap">{children}</p>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1 py-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
    </span>
  );
}
