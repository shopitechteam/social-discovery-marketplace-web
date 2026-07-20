"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { useLazyQuery } from "@apollo/client/react";
import {
  GetMyProfileDocument,
  GetMyPostsDocument,
  GetMySavedContentDocument,
  GetMyAnalyticsDocument,
  UpdateMyProfileDocument,
  CheckUsernameAvailabilityDocument,
} from "@/types/__generated__/graphql";

// Profile data changes rarely, so cached data renders instantly on revisit —
// but this query is viewer-scoped, so a resolution that happened while the
// access token was missing/expired caches `me: null`. Under cache-first that
// bad state is sticky and the profile screen stays blank until a hard reload.
// cache-and-network keeps the instant paint AND re-reads on every mount, so a
// token refresh corrects it on the next visit. errorPolicy "all" is needed
// because the client only sets it for `query`/`mutate`, not `watchQuery`:
// without it any GraphQL error blanks `data` instead of surfacing `error`.
export function useMyProfile() {
  return useQuery(GetMyProfileDocument, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
  });
}

export function useMyPosts(limit = 18) {
  return useQuery(GetMyPostsDocument, {
    variables: { limit },
    fetchPolicy: "cache-and-network",
  });
}

export function useMySavedContent(limit = 18, enabled = true) {
  return useQuery(GetMySavedContentDocument, {
    variables: { limit },
    fetchPolicy: "cache-and-network",
    skip: !enabled,
  });
}

export function useMyAnalytics(enabled = true) {
  return useQuery(GetMyAnalyticsDocument, {
    fetchPolicy: "cache-and-network",
    skip: !enabled,
  });
}

export function useUpdateProfile() {
  return useMutation(UpdateMyProfileDocument, {
    refetchQueries: [{ query: GetMyProfileDocument }],
  });
}

export function useCheckUsername() {
  return useLazyQuery(CheckUsernameAvailabilityDocument);
}
