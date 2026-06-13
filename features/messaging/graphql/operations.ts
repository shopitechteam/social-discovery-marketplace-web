import { gql } from "@apollo/client";

// GraphQL operations for the direct-message inbox.
// Extracted verbatim from the original InboxScreen — operation names unchanged
// so any Apollo cache behavior stays identical.

export const MY_DIRECT_CONVERSATIONS = gql`
  query MyDirectConversationsInbox($limit: Int!) {
    myDirectConversations(limit: $limit) {
      id
      contentId
      lastMessageId
      lastMessageText
      lastMessageType
      lastMessageSenderId
      lastMessageAt
      messageCount
      myUnreadCount
      otherParticipantOnline
      otherParticipantLastSeenAt
      otherParticipant {
        id
        username
        profile {
          firstName
          lastName
          avatar
        }
      }
      content {
        id
        title
        price {
          amount
          currency
        }
        location {
          placeName
          county
          subregion
        }
        media {
          thumbnailUrl
          imageUrl
          muxMeta {
            thumbnailUrl
            playbackId
          }
          r2Variants {
            url
            variant
          }
        }
      }
    }
  }
`;

export const DIRECT_CONVERSATION = gql`
  query DirectConversationInbox($conversationId: String!) {
    directConversation(conversationId: $conversationId) {
      id
      contentId
      lastMessageId
      lastMessageText
      lastMessageType
      lastMessageSenderId
      lastMessageAt
      messageCount
      myUnreadCount
      otherParticipantOnline
      otherParticipantLastSeenAt
      otherParticipant {
        id
        username
        profile {
          firstName
          lastName
          avatar
        }
      }
      content {
        id
        title
        price {
          amount
          currency
        }
        location {
          placeName
          county
          subregion
        }
        media {
          thumbnailUrl
          imageUrl
          muxMeta {
            thumbnailUrl
            playbackId
          }
          r2Variants {
            url
            variant
          }
        }
      }
    }
  }
`;

export const DIRECT_MESSAGES = gql`
  query DirectConversationMessagesInbox($input: DirectConversationMessagesInput!) {
    directConversationMessages(input: $input) {
      id
      conversationId
      contentId
      senderId
      recipientId
      type
      text
      mediaAssetId
      clientMessageId
      deliveredAt
      readAt
      createdAt
      isMine
      deliveryStatus
      mediaAsset {
        id
        type
        status
        thumbnailUrl
        displayWidth
        displayHeight
        errorMessage
        r2Variants {
          url
          variant
          width
          height
        }
        muxMeta {
          playbackId
          duration
          thumbnailUrl
          animatedThumbnailUrl
          aspectRatio
        }
      }
    }
  }
`;

export const MY_UNREAD_CONVERSATION_COUNT = gql`
  query MyUnreadDirectConversationCountInbox {
    myUnreadDirectConversationCount
  }
`;

export const ENSURE_DIRECT_CONVERSATION = gql`
  mutation EnsureDirectConversationInbox($input: EnsureDirectConversationInput!) {
    ensureDirectConversation(input: $input) {
      id
      contentId
      messageCount
      myUnreadCount
      otherParticipant {
        id
        username
        profile {
          firstName
          lastName
          avatar
        }
      }
      otherParticipantOnline
      otherParticipantLastSeenAt
      content {
        id
        title
        price {
          amount
          currency
        }
        location {
          placeName
          county
          subregion
        }
        media {
          thumbnailUrl
          imageUrl
          muxMeta {
            thumbnailUrl
            playbackId
          }
          r2Variants {
            url
            variant
          }
        }
      }
    }
  }
`;

export const SEND_DIRECT_MESSAGE = gql`
  mutation SendDirectMessageInbox($input: SendDirectMessageInput!) {
    sendDirectMessage(input: $input) {
      id
      conversationId
      contentId
      senderId
      recipientId
      type
      text
      mediaAssetId
      clientMessageId
      deliveredAt
      readAt
      createdAt
      isMine
      deliveryStatus
      mediaAsset {
        id
        type
        status
        thumbnailUrl
        displayWidth
        displayHeight
        errorMessage
        r2Variants {
          url
          variant
          width
          height
        }
        muxMeta {
          playbackId
          duration
          thumbnailUrl
          animatedThumbnailUrl
          aspectRatio
        }
      }
    }
  }
`;

export const MARK_DIRECT_CONVERSATION_READ = gql`
  mutation MarkDirectConversationReadInbox($input: MarkDirectConversationReadInput!) {
    markDirectConversationRead(input: $input)
  }
`;

export const REQUEST_IMAGE_UPLOAD = gql`
  mutation RequestImageUploadInbox($mimeType: String) {
    requestImageUpload(mimeType: $mimeType) {
      uploadUrl
      mediaAssetId
    }
  }
`;

export const NOTIFY_IMAGE_UPLOADED = gql`
  mutation NotifyImageUploadedInbox($mediaAssetId: String!) {
    notifyImageUploaded(mediaAssetId: $mediaAssetId) {
      id
      status
    }
  }
`;

export const REQUEST_VIDEO_UPLOAD = gql`
  mutation RequestVideoUploadInbox($corsOrigin: String) {
    requestVideoUpload(corsOrigin: $corsOrigin) {
      uploadUrl
      mediaAssetId
    }
  }
`;

export const NOTIFY_VIDEO_UPLOADED = gql`
  mutation NotifyVideoUploadedInbox($mediaAssetId: String!) {
    notifyVideoUploaded(mediaAssetId: $mediaAssetId) {
      id
      status
    }
  }
`;
