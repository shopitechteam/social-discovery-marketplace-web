import type { CodegenConfig } from "@graphql-codegen/cli";
import { config as loadEnv } from "dotenv";

loadEnv();

const GRAPHQL_URL = `${process.env.NEXT_PUBLIC_API_URL}/graphql`;

const scalars = {
  DateTime: "string",
  Date: "string",
  Upload: "File",
  JSON: "Record<string, unknown>",
  ID: "string",
};

const config: CodegenConfig = {
  schema: GRAPHQL_URL,

  generates: {
    // ── Shared scalar / enum / input types (used by all features) ──
    "graphql/generated/types.ts": {
      documents: [],
      plugins: ["typescript"],
      config: {
        scalars,
        enumsAsTypes: true,
        avoidOptionals: false,
        maybeValue: "T | null | undefined",
        nonOptionalTypename: true,
      },
    },

    // ── Per-feature: generate typed hooks next to each feature's graphql/ ──
    "features/auth/graphql/generated.ts": {
      documents: ["features/auth/graphql/**/*.graphql"],
      plugins: ["typescript-operations", "typescript-react-apollo"],
      config: {
        scalars,
        withHooks: true,
        withComponent: false,
        withHOC: false,
        reactApolloVersion: 3,
        importOperationTypesFrom: "Types",
      },
      preset: "import-types",
      presetConfig: { typesPath: "@/graphql/generated/types" },
    },

    "features/feed/graphql/generated.ts": {
      documents: ["features/feed/graphql/**/*.graphql"],
      plugins: ["typescript-operations", "typescript-react-apollo"],
      config: {
        scalars,
        withHooks: true,
        withComponent: false,
        withHOC: false,
        reactApolloVersion: 3,
        importOperationTypesFrom: "Types",
      },
      preset: "import-types",
      presetConfig: { typesPath: "@/graphql/generated/types" },
    },

    "features/product/graphql/generated.ts": {
      documents: ["features/product/graphql/**/*.graphql"],
      plugins: ["typescript-operations", "typescript-react-apollo"],
      config: {
        scalars,
        withHooks: true,
        withComponent: false,
        withHOC: false,
        reactApolloVersion: 3,
        importOperationTypesFrom: "Types",
      },
      preset: "import-types",
      presetConfig: { typesPath: "@/graphql/generated/types" },
    },

    "features/profile/graphql/generated.ts": {
      documents: ["features/profile/graphql/**/*.graphql"],
      plugins: ["typescript-operations", "typescript-react-apollo"],
      config: {
        scalars,
        withHooks: true,
        withComponent: false,
        withHOC: false,
        reactApolloVersion: 3,
        importOperationTypesFrom: "Types",
      },
      preset: "import-types",
      presetConfig: { typesPath: "@/graphql/generated/types" },
    },

    "features/search/graphql/generated.ts": {
      documents: ["features/search/graphql/**/*.graphql"],
      plugins: ["typescript-operations", "typescript-react-apollo"],
      config: {
        scalars,
        withHooks: true,
        withComponent: false,
        withHOC: false,
        reactApolloVersion: 3,
        importOperationTypesFrom: "Types",
      },
      preset: "import-types",
      presetConfig: { typesPath: "@/graphql/generated/types" },
    },

    "features/seller/graphql/generated.ts": {
      documents: ["features/seller/graphql/**/*.graphql"],
      plugins: ["typescript-operations", "typescript-react-apollo"],
      config: {
        scalars,
        withHooks: true,
        withComponent: false,
        withHOC: false,
        reactApolloVersion: 3,
        importOperationTypesFrom: "Types",
      },
      preset: "import-types",
      presetConfig: { typesPath: "@/graphql/generated/types" },
    },

    "features/creator/graphql/generated.ts": {
      documents: ["features/creator/graphql/**/*.graphql"],
      plugins: ["typescript-operations", "typescript-react-apollo"],
      config: {
        scalars,
        withHooks: true,
        withComponent: false,
        withHOC: false,
        reactApolloVersion: 3,
        importOperationTypesFrom: "Types",
      },
      preset: "import-types",
      presetConfig: { typesPath: "@/graphql/generated/types" },
    },

    "features/video/graphql/generated.ts": {
      documents: ["features/video/graphql/**/*.graphql"],
      plugins: ["typescript-operations", "typescript-react-apollo"],
      config: {
        scalars,
        withHooks: true,
        withComponent: false,
        withHOC: false,
        reactApolloVersion: 3,
        importOperationTypesFrom: "Types",
      },
      preset: "import-types",
      presetConfig: { typesPath: "@/graphql/generated/types" },
    },

    "features/notifications/graphql/generated.ts": {
      documents: ["features/notifications/graphql/**/*.graphql"],
      plugins: ["typescript-operations", "typescript-react-apollo"],
      config: {
        scalars,
        withHooks: true,
        withComponent: false,
        withHOC: false,
        reactApolloVersion: 3,
        importOperationTypesFrom: "Types",
      },
      preset: "import-types",
      presetConfig: { typesPath: "@/graphql/generated/types" },
    },
  },

  hooks: {
    afterAllFileWrite: ["npx prettier --write"],
  },

  ignoreNoDocuments: true,
};

export default config;
