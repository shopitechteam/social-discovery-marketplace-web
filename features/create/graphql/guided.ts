import { gql, type TypedDocumentNode } from "@apollo/client";

export type GuidedAutosaveInput = {
  title?: string;
  caption?: string;
  categoryId?: string;
  specs?: Array<{ key: string; value: string }>;
  aiClassification?: {
    level1?: string;
    level2?: string;
    confidence?: number;
  };
  price?: {
    amount: number;
    currency: string;
    negotiable: boolean;
  };
  location?: {
    placeName: string;
    formattedAddress: string;
    placeId: string;
    latitude?: number;
    longitude?: number;
    county?: string;
    subregion?: string;
  };
  contactPhone?: string;
  visibilityMode?: "PUBLIC" | "FRIENDS_ONLY" | "PRIVATE";
  allowDownload?: boolean;
  hdEnabled?: boolean;
};

export type GuidedExtractDetails = {
  title: string;
  description: string;
  price: number | null;
  currency: string;
  specs: Array<{ key: string; value: string }>;
  level1: string | null;
  level2: string | null;
  categoryId: string | null;
  classificationConfidence: number | null;
  suggestedPrice: number | null;
  priceRangeLow: number | null;
  priceRangeHigh: number | null;
  pricingReason: string | null;
  pricingConfidence: "high" | "medium" | "low" | null;
};

type GuidedExtractFramesData = {
  extractDraftDetailsFromFrames: GuidedExtractDetails | null;
};

type GuidedExtractFramesVariables = {
  id: string;
  frames: string[];
};

type GuidedExtractDraftData = {
  extractDraftDetails: GuidedExtractDetails | null;
};

type GuidedExtractDraftVariables = {
  id: string;
};

const GUIDED_DETAILS_FIELDS = gql`
  fragment GuidedExtractDetailsFields on ExtractedDetailsResult {
    title
    description
    price
    currency
    specs {
      key
      value
    }
    level1
    level2
    categoryId
    classificationConfidence
    suggestedPrice
    priceRangeLow
    priceRangeHigh
    pricingReason
    pricingConfidence
  }
`;

export const GUIDED_EXTRACT_FROM_FRAMES = gql`
  mutation GuidedExtractDraftDetailsFromFrames(
    $id: String!
    $frames: [String!]!
  ) {
    extractDraftDetailsFromFrames(id: $id, frames: $frames) {
      ...GuidedExtractDetailsFields
    }
  }
  ${GUIDED_DETAILS_FIELDS}
` as unknown as TypedDocumentNode<
  GuidedExtractFramesData,
  GuidedExtractFramesVariables
>;

export const GUIDED_EXTRACT_FROM_DRAFT = gql`
  mutation GuidedExtractDraftDetails($id: String!) {
    extractDraftDetails(id: $id) {
      ...GuidedExtractDetailsFields
    }
  }
  ${GUIDED_DETAILS_FIELDS}
` as unknown as TypedDocumentNode<
  GuidedExtractDraftData,
  GuidedExtractDraftVariables
>;

// ─── Shopi Agent conversation (shopiAgentTurn) ───────────────────────────────
//
// TypeGraphQL serialises enums as their TS KEYS over the wire, so these are the
// uppercase key names (SPEC, CONTACT_PHONE, …), not the lowercase values.

export type AgentAskKind =
  | "TEXT"
  | "LONGTEXT"
  | "NUMBER"
  | "PRICE"
  | "CHOICE"
  | "LOCATION"
  | "PHONE"
  | "CONFIRM";

export type AgentFieldTarget =
  | "TITLE"
  | "DESCRIPTION"
  | "CATEGORY"
  | "SPEC"
  | "PRICE"
  | "LOCATION"
  | "CONTACT_PHONE"
  | "NONE";

export type AgentRole = "AGENT" | "USER";

export type AgentAsk = {
  target: AgentFieldTarget;
  kind: AgentAskKind;
  specKey: string | null;
  label: string;
  helper: string | null;
  placeholder: string | null;
  options: string[];
  prefill: string | null;
  required: boolean;
};

export type AgentTurnResult = {
  message: string;
  ask: AgentAsk | null;
  readyToPublish: boolean;
  aiUsed: boolean;
  specs: Array<{ key: string; value: string }>;
};

export type AgentTranscriptEntry = { role: AgentRole; text: string };

export type AgentTurnInput = {
  transcript?: AgentTranscriptEntry[];
  answer?: string;
  answeredTarget?: AgentFieldTarget;
  answeredSpecKey?: string;
  suggestedPrice?: number | null;
};

export const SHOPI_AGENT_TURN = gql`
  mutation ShopiAgentTurn($id: String!, $input: AgentTurnInput!) {
    shopiAgentTurn(id: $id, input: $input) {
      message
      readyToPublish
      aiUsed
      specs {
        key
        value
      }
      ask {
        target
        kind
        specKey
        label
        helper
        placeholder
        options
        prefill
        required
      }
    }
  }
` as unknown as TypedDocumentNode<
  { shopiAgentTurn: AgentTurnResult },
  { id: string; input: AgentTurnInput }
>;

export const GUIDED_AUTOSAVE_DRAFT = gql`
  mutation GuidedAutosaveDraft($id: String!, $input: AutosaveDraftInput!) {
    autosaveDraft(id: $id, input: $input) {
      id
      currentStep
      version
    }
  }
` as unknown as TypedDocumentNode<
  {
    autosaveDraft: {
      id: string;
      currentStep: string;
      version: number;
    };
  },
  { id: string; input: GuidedAutosaveInput }
>;
