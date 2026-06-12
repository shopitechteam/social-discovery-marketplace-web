"use client";

import Image from "next/image";
import Link from "next/link";
import { Camera, Check, ChevronLeft, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SHIMMER_AVATAR } from "@/lib/shimmer";
import type { ProfileUserFieldsFragment } from "@/types/__generated__/graphql";
import { useAuthStore } from "@/stores/auth";
import {
  useCheckUsername,
  useMyProfile,
  useUpdateProfile,
} from "../hooks/useMyProfile";
import { useAvatarUpload } from "../hooks/useAvatarUpload";

type FormValues = {
  firstName: string;
  lastName: string;
  username: string;
  bio: string;
  website: string;
};

type Field = {
  name: keyof FormValues;
  label: string;
  placeholder: string;
  maxLength: number;
  multiline?: boolean;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
};

const fields: Field[] = [
  {
    name: "firstName",
    label: "First name",
    placeholder: "First name",
    maxLength: 50,
  },
  {
    name: "lastName",
    label: "Last name",
    placeholder: "Last name",
    maxLength: 50,
  },
  {
    name: "username",
    label: "Username",
    placeholder: "Username",
    maxLength: 30,
  },
  {
    name: "bio",
    label: "Bio",
    placeholder: "Tell your story...",
    maxLength: 160,
    multiline: true,
  },
  {
    name: "website",
    label: "Website",
    placeholder: "yoursite.com",
    maxLength: 100,
    inputMode: "url",
  },
];

function getInitialForm(user: ProfileUserFieldsFragment): FormValues {
  return {
    firstName: user.profile?.firstName ?? "",
    lastName: user.profile?.lastName ?? "",
    username: user.username ?? "",
    bio: user.profile?.bio ?? "",
    website: user.profile?.website ?? "",
  };
}

function getDisplayName(user: ProfileUserFieldsFragment, form: FormValues) {
  return (
    [form.firstName, form.lastName].filter(Boolean).join(" ") ||
    user.username ||
    "Your profile"
  );
}

function EditProfileSkeleton({ lang }: { lang: string }) {
  return (
    <div className="min-h-svh animate-pulse bg-app">
      <div
        className="sticky top-0 z-20 flex h-14 items-center justify-between border-b px-3"
        style={{
          backgroundColor: "rgb(var(--color-bg) / 0.94)",
          borderColor: "rgb(var(--color-border))",
        }}
      >
        <Link
          href={`/${lang}/profile`}
          className="flex h-10 w-10 items-center justify-center rounded-md"
          aria-label="Back to profile"
        >
          <ChevronLeft size={38} strokeWidth={2.5} aria-hidden />
        </Link>
        <div
          className="h-5 w-24 rounded-md"
          style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
        />
        <div className="h-10 w-14" />
      </div>
      <div className="px-4 py-5">
        <div className="mb-6 flex items-center gap-4">
          <div
            className="h-20 w-20 rounded-full"
            style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
          />
          <div className="flex-1 space-y-2">
            <div
              className="h-5 w-32 rounded-md"
              style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
            />
            <div
              className="h-4 w-24 rounded-md"
              style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
            />
          </div>
        </div>
        <div className="space-y-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div
                className="h-3 w-20 rounded-md"
                style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
              />
              <div
                className="h-11 rounded-md"
                style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EditProfileScreen({ lang }: { lang: string }) {
  const { data, loading } = useMyProfile();

  if (loading && !data) return <EditProfileSkeleton lang={lang} />;
  if (!data?.me) return null;

  return <EditProfileForm key={data.me.id} user={data.me} lang={lang} />;
}

function EditProfileForm({
  user,
  lang,
}: {
  user: ProfileUserFieldsFragment;
  lang: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormValues>(() => getInitialForm(user));
  const [usernameState, setUsernameState] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [updateProfile, { loading, error }] = useUpdateProfile();
  const [checkUsername] = useCheckUsername();
  const setUser = useAuthStore((s) => s.setUser);

  // Avatar: local override (CDN url returned by the upload endpoint). null until
  // the user picks a new picture.
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    upload: uploadAvatar,
    uploading: avatarUploading,
    error: avatarError,
  } = useAvatarUpload();

  const initial = getInitialForm(user);
  const fieldsChanged = fields.some(
    (field) => form[field.name] !== initial[field.name],
  );
  const hasChanges = fieldsChanged || avatarUrl !== null;
  const usernameInvalid =
    form.username !== initial.username && form.username.trim().length < 3;
  const saveDisabled =
    !hasChanges ||
    loading ||
    avatarUploading ||
    usernameInvalid ||
    usernameState === "checking" ||
    usernameState === "taken";

  const displayName = getDisplayName(user, form);
  const avatar = avatarUrl ?? user.profile?.avatar;
  const initials =
    [form.firstName[0], form.lastName[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  useEffect(() => {
    return () => {
      if (usernameTimer.current) clearTimeout(usernameTimer.current);
    };
  }, []);

  function handleUsernameChange(value: string) {
    const normalized = value.toLowerCase().replace(/[^a-z0-9_.]/g, "");
    setForm((current) => ({ ...current, username: normalized }));

    if (usernameTimer.current) clearTimeout(usernameTimer.current);
    if (normalized.length < 3 || normalized === (user.username ?? "")) {
      setUsernameState("idle");
      return;
    }

    setUsernameState("checking");
    usernameTimer.current = setTimeout(async () => {
      const { data } = await checkUsername({
        variables: { username: normalized },
      });
      setUsernameState(data?.checkUsername.available ? "available" : "taken");
    }, 500);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset the input so picking the same file again still fires onChange
    e.target.value = "";
    if (!file) return;
    const url = await uploadAvatar(file);
    if (url) setAvatarUrl(url);
  }

  async function handleSave() {
    if (saveDisabled) return;

    const input: Record<string, string> = {};
    if (form.firstName !== initial.firstName) input.firstName = form.firstName;
    if (form.lastName !== initial.lastName) input.lastName = form.lastName;
    if (form.username !== initial.username) input.username = form.username;
    if (form.bio !== initial.bio) input.bio = form.bio;
    if (form.website !== initial.website) input.website = form.website;
    if (avatarUrl !== null) input.avatar = avatarUrl;

    const { data } = await updateProfile({ variables: { input } });
    if (!data?.updateProfile) return;

    const updated = data.updateProfile;
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      setUser({
        ...currentUser,
        profile: updated.profile
          ? {
              firstName: updated.profile.firstName ?? null,
              lastName: updated.profile.lastName ?? null,
              avatar: updated.profile.avatar ?? null,
            }
          : null,
      });
    }

    router.replace(`/${lang}/profile`);
  }

  return (
    <div className="min-h-svh bg-app">
      <header
        className="sticky top-0 z-20 flex h-14 items-center justify-between border-b px-3"
        style={{
          backgroundColor: "rgb(var(--color-bg) / 0.94)",
          borderColor: "rgb(var(--color-border))",
          backdropFilter: "blur(14px) saturate(150%)",
          WebkitBackdropFilter: "blur(14px) saturate(150%)",
        }}
      >
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-14 w-14 rounded-md"
          style={{ color: "rgb(var(--color-text))" }}
        >
          <Link href={`/${lang}/profile`} aria-label="Back to profile">
            <ChevronLeft size={38} strokeWidth={2.5} />
          </Link>
        </Button>

        <h1
          className="font-bold"
          style={{
            color: "rgb(var(--color-text))",
            fontSize: "var(--text-base)",
          }}
        >
          Edit profile
        </h1>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSave}
          disabled={saveDisabled}
          className="h-10 px-2 font-bold"
          style={{
            color: "rgb(var(--brand-primary))",
            fontSize: "var(--text-sm)",
          }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Save"}
        </Button>
      </header>

      <main
        className="px-4 pt-5"
        style={{ paddingBottom: "calc(var(--safe-bottom) + 1rem)" }}
      >
        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full border transition-opacity active:opacity-80"
            style={{
              background: avatar
                ? "rgb(var(--color-bg-subtle))"
                : "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)) 62%, rgb(var(--brand-accent)))",
              borderColor: "rgb(var(--color-bg-elevated))",
            }}
            aria-label="Change profile picture"
          >
            {avatar ? (
              <Image
                src={avatar}
                alt={displayName}
                fill
                sizes="80px"
                className="object-cover"
                placeholder="blur"
                blurDataURL={SHIMMER_AVATAR}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span
                  className="select-none font-bold text-white"
                  style={{ fontSize: "var(--text-lg)" }}
                >
                  {initials}
                </span>
              </div>
            )}
            {/* Camera / uploading overlay */}
            <span
              className="absolute inset-0 flex items-center justify-center transition-opacity"
              style={{
                backgroundColor: "rgba(0,0,0,0.4)",
                opacity: avatarUploading ? 1 : undefined,
              }}
            >
              {avatarUploading ? (
                <Loader2 size={22} className="animate-spin text-white" />
              ) : (
                <Camera
                  size={22}
                  strokeWidth={2.2}
                  className="text-white opacity-0 transition-opacity group-hover:opacity-100"
                />
              )}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="font-semibold"
              style={{
                color: "rgb(var(--brand-primary))",
                fontSize: "var(--text-sm)",
              }}
            >
              {avatarUploading ? "Uploading…" : "Change photo"}
            </button>
            <p
              className="mt-0.5 truncate"
              style={{
                color: "rgb(var(--color-text-muted))",
                fontSize: "var(--text-sm)",
              }}
            >
              @{form.username || "username"}
            </p>
            {avatarError && (
              <p
                style={{
                  color: "rgb(var(--color-error))",
                  fontSize: "var(--text-xs)",
                }}
              >
                {avatarError}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {fields.map((field) => {
            const value = form[field.name];
            const isUsername = field.name === "username";

            return (
              <div key={field.name} className="space-y-1.5">
                <label
                  htmlFor={`edit-profile-${field.name}`}
                  className="font-semibold"
                  style={{
                    color: "rgb(var(--color-text-muted))",
                    fontSize: "var(--text-xs)",
                  }}
                >
                  {field.label}
                </label>

                {field.multiline ? (
                  <>
                    <textarea
                      id={`edit-profile-${field.name}`}
                      value={value}
                      onChange={(e) =>
                        setForm((c) => ({ ...c, [field.name]: e.target.value }))
                      }
                      placeholder={field.placeholder}
                      maxLength={field.maxLength}
                      rows={4}
                      className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm placeholder:text-sm font-medium leading-relaxed outline-none transition-colors placeholder:opacity-40 focus:border-[rgb(var(--color-border))]"
                      style={{
                        backgroundColor: "rgb(var(--color-bg-elevated))",
                        borderColor: "rgb(var(--color-border))",
                        color: "rgb(var(--color-text))",
                        fontSize: "var(--text-sm)",
                      }}
                    />
                    <p
                      className="text-right"
                      style={{
                        color: "rgb(var(--color-text-muted))",
                        fontSize: "var(--text-xs)",
                      }}
                    >
                      {value.length}/{field.maxLength}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      {isUsername && (
                        <span
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                          style={{
                            color: "rgb(var(--color-text-muted))",
                            fontSize: "var(--text-md)",
                          }}
                        >
                          @
                        </span>
                      )}
                      <input
                        id={`edit-profile-${field.name}`}
                        type={field.name === "website" ? "url" : "text"}
                        inputMode={field.inputMode}
                        value={value}
                        onChange={(e) =>
                          isUsername
                            ? handleUsernameChange(e.target.value)
                            : setForm((c) => ({
                                ...c,
                                [field.name]: e.target.value,
                              }))
                        }
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        className="h-12 w-full text-sm placeholder:text-sm rounded-lg border px-3 font-medium outline-none transition-colors placeholder:opacity-40"
                        style={{
                          backgroundColor: "rgb(var(--color-bg-elevated))",
                          borderColor:
                            isUsername && usernameState === "taken"
                              ? "rgb(var(--color-error))"
                              : isUsername && usernameState === "available"
                                ? "rgb(var(--color-success))"
                                : "rgb(var(--color-border))",
                          color: "rgb(var(--color-text))",
                          fontSize: "var(--text-sm)",
                          paddingLeft: isUsername ? "1.9rem" : undefined,
                        }}
                      />
                      {isUsername && usernameState !== "idle" && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {usernameState === "checking" && (
                            <Loader2
                              size={15}
                              className="animate-spin"
                              style={{ color: "rgb(var(--color-text-muted))" }}
                            />
                          )}
                          {usernameState === "available" && (
                            <Check
                              size={15}
                              strokeWidth={2.5}
                              style={{ color: "rgb(var(--color-success))" }}
                            />
                          )}
                          {usernameState === "taken" && (
                            <X
                              size={15}
                              strokeWidth={2.5}
                              style={{ color: "rgb(var(--color-error))" }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                    {isUsername && (
                      <p
                        style={{
                          color:
                            usernameState === "taken" || usernameInvalid
                              ? "rgb(var(--color-error))"
                              : usernameState === "available"
                                ? "rgb(var(--color-success))"
                                : "rgb(var(--color-text-muted))",
                          fontSize: "var(--text-xs)",
                        }}
                      >
                        {usernameInvalid
                          ? "Username must be at least 3 characters"
                          : usernameState === "taken"
                            ? "That username is taken"
                            : usernameState === "available"
                              ? "Username is available"
                              : "Letters, numbers, dots and underscores"}
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <p
            className="mt-5 rounded-md border px-3 py-2"
            style={{
              backgroundColor: "rgb(var(--color-error) / 0.08)",
              borderColor: "rgb(var(--color-error) / 0.24)",
              color: "rgb(var(--color-error))",
              fontSize: "var(--text-sm)",
            }}
          >
            {error.message}
          </p>
        )}
      </main>
    </div>
  );
}
