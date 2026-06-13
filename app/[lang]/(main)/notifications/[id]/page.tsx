import { ChatDetailScreen } from "@/features/messaging/components/ChatDetailScreen";

export default async function ConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; id: string }>;
  searchParams: Promise<{ source?: string }>;
}) {
  const { lang, id } = await params;
  const { source } = await searchParams;
  // `?source=content` → the [id] segment is a post/content id; the screen ensures
  // the conversation in place. Otherwise it's an existing conversation id.
  return (
    <ChatDetailScreen
      lang={lang}
      conversationId={id}
      mode={source === "content" ? "content" : "conversation"}
    />
  );
}
