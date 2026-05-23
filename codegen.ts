import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://localhost:4000/graphql",
  documents: [
    "features/**/*.tsx",
    "features/**/*.ts",
    "features/**/*.graphql",
    "app/**/*.tsx",
    "app/**/*.ts",
  ],
  generates: {
    "./types/__generated__/": {
      preset: "client",
      plugins: [],
      presetConfig: {
        gqlTagName: "gql",
        fragmentMasking: false,
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
