/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "fragment AuthUserFields on User {\n  id\n  email\n  role\n  isVerified\n  profile {\n    firstName\n    lastName\n    avatar\n  }\n}\n\nfragment AuthPayloadFields on AuthPayload {\n  accessToken\n  refreshToken\n  user {\n    ...AuthUserFields\n  }\n}\n\nmutation RegisterWithEmail($input: RegisterEmailInput!) {\n  registerWithEmail(input: $input) {\n    ... on AuthPayload {\n      ...AuthPayloadFields\n    }\n    ... on PendingAccountLink {\n      status\n      email\n      existingProviders\n    }\n  }\n}\n\nmutation VerifyEmailAndLinkPassword($input: VerifyAndLinkInput!) {\n  verifyEmailAndLinkPassword(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation LoginWithEmail($input: LoginEmailInput!) {\n  loginWithEmail(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation RefreshToken($input: RefreshTokenInput!) {\n  refreshToken(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation LoginWithGoogle($input: OAuthInput!) {\n  loginWithGoogle(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation LoginWithApple($input: OAuthInput!) {\n  loginWithApple(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation LoginWithFacebook($input: OAuthInput!) {\n  loginWithFacebook(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation Logout($refreshToken: String!) {\n  logout(refreshToken: $refreshToken)\n}": typeof types.AuthUserFieldsFragmentDoc,
};
const documents: Documents = {
    "fragment AuthUserFields on User {\n  id\n  email\n  role\n  isVerified\n  profile {\n    firstName\n    lastName\n    avatar\n  }\n}\n\nfragment AuthPayloadFields on AuthPayload {\n  accessToken\n  refreshToken\n  user {\n    ...AuthUserFields\n  }\n}\n\nmutation RegisterWithEmail($input: RegisterEmailInput!) {\n  registerWithEmail(input: $input) {\n    ... on AuthPayload {\n      ...AuthPayloadFields\n    }\n    ... on PendingAccountLink {\n      status\n      email\n      existingProviders\n    }\n  }\n}\n\nmutation VerifyEmailAndLinkPassword($input: VerifyAndLinkInput!) {\n  verifyEmailAndLinkPassword(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation LoginWithEmail($input: LoginEmailInput!) {\n  loginWithEmail(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation RefreshToken($input: RefreshTokenInput!) {\n  refreshToken(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation LoginWithGoogle($input: OAuthInput!) {\n  loginWithGoogle(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation LoginWithApple($input: OAuthInput!) {\n  loginWithApple(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation LoginWithFacebook($input: OAuthInput!) {\n  loginWithFacebook(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation Logout($refreshToken: String!) {\n  logout(refreshToken: $refreshToken)\n}": types.AuthUserFieldsFragmentDoc,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "fragment AuthUserFields on User {\n  id\n  email\n  role\n  isVerified\n  profile {\n    firstName\n    lastName\n    avatar\n  }\n}\n\nfragment AuthPayloadFields on AuthPayload {\n  accessToken\n  refreshToken\n  user {\n    ...AuthUserFields\n  }\n}\n\nmutation RegisterWithEmail($input: RegisterEmailInput!) {\n  registerWithEmail(input: $input) {\n    ... on AuthPayload {\n      ...AuthPayloadFields\n    }\n    ... on PendingAccountLink {\n      status\n      email\n      existingProviders\n    }\n  }\n}\n\nmutation VerifyEmailAndLinkPassword($input: VerifyAndLinkInput!) {\n  verifyEmailAndLinkPassword(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation LoginWithEmail($input: LoginEmailInput!) {\n  loginWithEmail(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation RefreshToken($input: RefreshTokenInput!) {\n  refreshToken(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation LoginWithGoogle($input: OAuthInput!) {\n  loginWithGoogle(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation LoginWithApple($input: OAuthInput!) {\n  loginWithApple(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation LoginWithFacebook($input: OAuthInput!) {\n  loginWithFacebook(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation Logout($refreshToken: String!) {\n  logout(refreshToken: $refreshToken)\n}"): (typeof documents)["fragment AuthUserFields on User {\n  id\n  email\n  role\n  isVerified\n  profile {\n    firstName\n    lastName\n    avatar\n  }\n}\n\nfragment AuthPayloadFields on AuthPayload {\n  accessToken\n  refreshToken\n  user {\n    ...AuthUserFields\n  }\n}\n\nmutation RegisterWithEmail($input: RegisterEmailInput!) {\n  registerWithEmail(input: $input) {\n    ... on AuthPayload {\n      ...AuthPayloadFields\n    }\n    ... on PendingAccountLink {\n      status\n      email\n      existingProviders\n    }\n  }\n}\n\nmutation VerifyEmailAndLinkPassword($input: VerifyAndLinkInput!) {\n  verifyEmailAndLinkPassword(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation LoginWithEmail($input: LoginEmailInput!) {\n  loginWithEmail(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation RefreshToken($input: RefreshTokenInput!) {\n  refreshToken(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation LoginWithGoogle($input: OAuthInput!) {\n  loginWithGoogle(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation LoginWithApple($input: OAuthInput!) {\n  loginWithApple(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation LoginWithFacebook($input: OAuthInput!) {\n  loginWithFacebook(input: $input) {\n    ...AuthPayloadFields\n  }\n}\n\nmutation Logout($refreshToken: String!) {\n  logout(refreshToken: $refreshToken)\n}"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;