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
    blockedByMe
    blockedByOther
    canSendMessages
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
      blockedByMe
      blockedByOther
      canSendMessages
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
      blockedByMe
      blockedByOther
      canSendMessages
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

export const DELETE_DIRECT_CONVERSATION = gql`
  mutation DeleteDirectConversationInbox($conversationId: String!) {
    deleteDirectConversation(conversationId: $conversationId)
  }
`;

export const BLOCK_DIRECT_CONVERSATION = gql`
  mutation BlockDirectConversationInbox($conversationId: String!) {
    blockDirectConversation(conversationId: $conversationId) {
      id
      contentId
      lastMessageId
      lastMessageText
      lastMessageType
      lastMessageSenderId
      lastMessageAt
      messageCount
      myUnreadCount
      blockedByMe
      blockedByOther
      canSendMessages
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

export const UNBLOCK_DIRECT_CONVERSATION = gql`
  mutation UnblockDirectConversationInbox($conversationId: String!) {
    unblockDirectConversation(conversationId: $conversationId) {
      id
      contentId
      lastMessageId
      lastMessageText
      lastMessageType
      lastMessageSenderId
      lastMessageAt
      messageCount
      myUnreadCount
      blockedByMe
      blockedByOther
      canSendMessages
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

export const REPORT_DIRECT_CONVERSATION = gql`
  mutation ReportDirectConversationInbox($input: ReportDirectConversationInput!) {
    reportDirectConversation(input: $input)
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

export const MY_WEB_PUSH_STATUS = gql`
  query MyWebPushStatusInbox {
    myWebPushStatus {
      isAvailable
      isEnabled
      activeSubscriptionCount
      publicKey
    }
  }
`;

export const SAVE_WEB_PUSH_SUBSCRIPTION = gql`
  mutation SaveWebPushSubscriptionInbox($input: SaveWebPushSubscriptionInput!) {
    saveWebPushSubscription(input: $input) {
      isAvailable
      isEnabled
      activeSubscriptionCount
      publicKey
    }
  }
`;

export const REMOVE_WEB_PUSH_SUBSCRIPTION = gql`
  mutation RemoveWebPushSubscriptionInbox($endpoint: String!) {
    removeWebPushSubscription(endpoint: $endpoint)
  }
`;
