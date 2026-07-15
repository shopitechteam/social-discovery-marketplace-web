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

// Profile data changes rarely, so default to cache-first: revisits render
// instantly from cache instead of refetching on every mount. Mutations
// (useUpdateProfile, create/delete post) keep the cache correct via
// refetchQueries / cache writes, so we don't need a network read every time.
export function useMyProfile() {
  return useQuery(GetMyProfileDocument, { fetchPolicy: "cache-first" });
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
