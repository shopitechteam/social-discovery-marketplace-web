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
