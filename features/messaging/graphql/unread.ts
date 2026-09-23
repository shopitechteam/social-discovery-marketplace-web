import { gql } from "@apollo/client";

// Kept separate from the large inbox operation module so the persistent mobile
// navigation can read its badge without downloading the full chat query set.
export const MY_UNREAD_CONVERSATION_COUNT = gql`
  query MyUnreadDirectConversationCountInbox {
    myUnreadDirectConversationCount
  }
`;

/**
 * Unread messages, not threads — a conversation holding four unread replies
 * contributes four. This is what badges should show; the thread count above
 * answers a different question ("how many chats need attention") and reads as
 * wrong on a badge, because four new messages from one person showed as 1.
 */
export const MY_UNREAD_MESSAGE_COUNT = gql`
  query MyUnreadDirectMessageCountInbox {
    myUnreadDirectMessageCount
  }
`;
