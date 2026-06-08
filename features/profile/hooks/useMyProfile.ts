"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { useLazyQuery } from "@apollo/client/react";
import {
  GetMyProfileDocument,
  GetMyPostsDocument,
  GetMyAnalyticsDocument,
  UpdateMyProfileDocument,
  CheckUsernameAvailabilityDocument,
} from "@/types/__generated__/graphql";
import type { UpdateProfileInput } from "@/types/__generated__/graphql";

export function useMyProfile() {
  return useQuery(GetMyProfileDocument, { fetchPolicy: "cache-and-network" });
}

export function useMyPosts(limit = 18) {
  return useQuery(GetMyPostsDocument, {
    variables: { limit },
    fetchPolicy: "cache-and-network",
  });
}

export function useMyAnalytics() {
  return useQuery(GetMyAnalyticsDocument, { fetchPolicy: "cache-and-network" });
}

export function useUpdateProfile() {
  return useMutation(UpdateMyProfileDocument, {
    refetchQueries: [{ query: GetMyProfileDocument }],
  });
}

export function useCheckUsername() {
  return useLazyQuery(CheckUsernameAvailabilityDocument);
}
