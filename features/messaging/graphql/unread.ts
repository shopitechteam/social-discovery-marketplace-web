import { gql } from "@apollo/client";

// Kept separate from the large inbox operation module so the persistent mobile
// navigation can read its badge without downloading the full chat query set.
export const MY_UNREAD_CONVERSATION_COUNT = gql`
  query MyUnreadDirectConversationCountInbox {
    myUnreadDirectConversationCount
  }
`;
