import { gql, type TypedDocumentNode } from "@apollo/client";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";

/**
 * Ask Shopi — conversational buyer search.
 *
 * The buyer talks to Shopi instead of using filters. Each turn we send the
 * transcript and the criteria understood so far; Shopi either asks one
 * follow-up or returns matching listings. State lives on the client and is
 * echoed back, so the search is stateless server-side.
 */

export type BuyerCriteria = {
  query?: string | null;
  categoryLevel1?: string | null;
  county?: string | null;
  nationwide?: boolean | null;
  radiusKm?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  negotiableOnly?: boolean | null;
  sort?: string | null;
  exactMatchPreferred?: boolean | null;
};

export type BuyerAsk = {
  /** QUERY | CATEGORY | LOCATION | BUDGET (GraphQL enum names). */
  field: string;
  label: string;
  helper?: string | null;
  placeholder?: string | null;
  options: string[];
};

export type BuyerTranscriptEntry = { role: "AGENT" | "USER"; text: string };

export type SavedAskShopiMessage = { role: "AGENT" | "USER"; text: string };

export type SavedAskShopiConversation = {
  id: string;
  title: string;
  messages: SavedAskShopiMessage[];
  criteria: BuyerCriteria;
  ask: BuyerAsk | null;
  hasSearched: boolean;
  createdAt: unknown;
  updatedAt: unknown;
};

export type ShopiBuyerTurnResult = {
  conversationId?: string | null;
  message: string;
  ask: BuyerAsk | null;
  readyToSearch: boolean;
  criteria: BuyerCriteria;
  aiUsed: boolean;
  results: {
    items: ContentCardFieldsFragment[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

export type ShopiBuyerTurnData = { shopiBuyerTurn: ShopiBuyerTurnResult };

export type ShopiBuyerTurnVars = {
  input: {
    conversationId?: string;
    transcript?: BuyerTranscriptEntry[];
    criteria?: BuyerCriteria;
    activeResultCount?: number;
    imageDataUrl?: string;
  };
};

export type AskShopiConversationsData = {
  askShopiConversations: SavedAskShopiConversation[];
};

export type DeleteAskShopiConversationData = {
  deleteAskShopiConversation: boolean;
};

export type DeleteAskShopiConversationVars = {
  conversationId: string;
};

export type AskShopiConversationResultsData = {
  askShopiConversationResults: {
    items: ContentCardFieldsFragment[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

export type AskShopiConversationResultsVars = {
  conversationId: string;
};

/** Strip Apollo's __typename and empty fields before echoing criteria back. */
export function toCriteriaInput(criteria: BuyerCriteria | undefined): BuyerCriteria | undefined {
  if (!criteria) return undefined;
  const out: BuyerCriteria = {};
  if (criteria.query) out.query = criteria.query;
  if (criteria.categoryLevel1) out.categoryLevel1 = criteria.categoryLevel1;
  if (criteria.county) out.county = criteria.county;
  if (criteria.nationwide) out.nationwide = criteria.nationwide;
  if (criteria.radiusKm != null) out.radiusKm = criteria.radiusKm;
  if (criteria.minPrice != null) out.minPrice = criteria.minPrice;
  if (criteria.maxPrice != null) out.maxPrice = criteria.maxPrice;
  if (criteria.negotiableOnly) out.negotiableOnly = criteria.negotiableOnly;
  if (criteria.sort) out.sort = criteria.sort;
  if (criteria.exactMatchPreferred) out.exactMatchPreferred = criteria.exactMatchPreferred;
  return Object.keys(out).length ? out : undefined;
}

export const SHOPI_BUYER_TURN: TypedDocumentNode<ShopiBuyerTurnData, ShopiBuyerTurnVars> = gql`
  mutation ShopiBuyerTurn($input: ShopiBuyerTurnInput!) {
    shopiBuyerTurn(input: $input) {
      conversationId
      message
      readyToSearch
      aiUsed
      ask {
        field
        label
        helper
        placeholder
        options
      }
      criteria {
        query
        categoryLevel1
        county
        nationwide
        radiusKm
        minPrice
        maxPrice
        negotiableOnly
        sort
        exactMatchPreferred
      }
      results {
        items {
          id
          slug
          type
          title
          caption
          hashtags
          creatorId
          allowDownload
          hdEnabled
          createdAt
          creator {
            id
            username
            isFollowedByMe
            followerCount
            profile {
              firstName
              lastName
              avatar
            }
          }
          media {
            mediaType
            url
            imageUrl
            thumbnailUrl
            sortOrder
            displayWidth
            displayHeight
            muxMeta {
              playbackId
              duration
              aspectRatio
              thumbnailUrl
              animatedThumbnailUrl
            }
            r2Variants {
              url
              variant
              width
              height
            }
          }
          price {
            amount
            currency
            negotiable
          }
          stats {
            views
            likes
            shares
            saves
          }
          location {
            county
            subregion
            placeName
          }
          ranking {
            rankScore
            trendingScore
          }
          isLikedByMe
          isSavedByMe
          isMyContent
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const ASK_SHOPI_CONVERSATIONS: TypedDocumentNode<AskShopiConversationsData> = gql`
  query AskShopiConversations {
    askShopiConversations {
      id
      title
      createdAt
      updatedAt
      hasSearched
      messages {
        role
        text
      }
      criteria {
        query
        categoryLevel1
        county
        nationwide
        radiusKm
        minPrice
        maxPrice
        negotiableOnly
        sort
        exactMatchPreferred
      }
      ask {
        field
        label
        helper
        placeholder
        options
      }
    }
  }
`;

export const DELETE_ASK_SHOPI_CONVERSATION: TypedDocumentNode<
  DeleteAskShopiConversationData,
  DeleteAskShopiConversationVars
> = gql`
  mutation DeleteAskShopiConversation($conversationId: String!) {
    deleteAskShopiConversation(conversationId: $conversationId)
  }
`;

export const ASK_SHOPI_CONVERSATION_RESULTS: TypedDocumentNode<
  AskShopiConversationResultsData,
  AskShopiConversationResultsVars
> = gql`
  query AskShopiConversationResults($conversationId: String!) {
    askShopiConversationResults(conversationId: $conversationId) {
      items {
        id
        slug
        type
        title
        caption
        hashtags
        creatorId
        allowDownload
        hdEnabled
        createdAt
        creator {
          id
          username
          isFollowedByMe
          followerCount
          profile {
            firstName
            lastName
            avatar
          }
        }
        media {
          mediaType
          url
          imageUrl
          thumbnailUrl
          sortOrder
          displayWidth
          displayHeight
          muxMeta {
            playbackId
            duration
            aspectRatio
            thumbnailUrl
            animatedThumbnailUrl
          }
          r2Variants {
            url
            variant
            width
            height
          }
        }
        price {
          amount
          currency
          negotiable
        }
        stats {
          views
          likes
          shares
          saves
        }
        location {
          county
          subregion
          placeName
        }
        ranking {
          rankScore
          trendingScore
        }
        isLikedByMe
        isSavedByMe
        isMyContent
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
