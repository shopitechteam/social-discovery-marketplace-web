"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProfile, useCheckUsername } from "../hooks/useMyProfile";
import type { ProfileUserFieldsFragment } from "@/types/__generated__/graphql";
import { useAuthStore } from "@/stores/auth";

interface Props {
  user: ProfileUserFieldsFragment;
  open: boolean;
  onClose: () => void;
}

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
};

const fields: Field[] = [
  { name: "firstName", label: "First name", placeholder: "Ada", maxLength: 50 },
  {
    name: "lastName",
    label: "Last name",
    placeholder: "Lovelace",
    maxLength: 50,
  },
  {
    name: "username",
    label: "Username",
    placeholder: "ada.lovelace",
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

export function EditProfileSheet({ user, open, onClose }: Props) {
  const [form, setForm] = useState<FormValues>(() => getInitialForm(user));
  const [usernameState, setUsernameState] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [updateProfile, { loading, error }] = useUpdateProfile();
  const [checkUsername] = useCheckUsername();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    return () => {
      if (usernameTimer.current) clearTimeout(usernameTimer.current);
    };
  }, []);

  function handleUsernameChange(val: string) {
    const normalized = val.toLowerCase().replace(/[^a-z0-9_.]/g, "");
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

  async function handleSave() {
    if (usernameState === "taken") return;

    const input: Record<string, string> = {};
    if (form.firstName !== (user.profile?.firstName ?? ""))
      input.firstName = form.firstName;
    if (form.lastName !== (user.profile?.lastName ?? ""))
      input.lastName = form.lastName;
    if (form.username !== (user.username ?? "")) input.username = form.username;
    if (form.bio !== (user.profile?.bio ?? "")) input.bio = form.bio;
    if (form.website !== (user.profile?.website ?? ""))
      input.website = form.website;

    if (!Object.keys(input).length) {
      onClose();
      return;
    }

    const { data } = await updateProfile({ variables: { input } });
    if (data?.updateProfile) {
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

      onClose();
    }
  }

  return (
    <Drawer
      open={open}
      fixed
      shouldScaleBackground={false}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DrawerContent
        className="mx-auto flex h-[88svh] w-full max-w-[430px] flex-col gap-0 overflow-hidden rounded-t-lg border p-0 focus:outline-none"
        style={{
          backgroundColor: "rgb(var(--color-bg-elevated))",
          borderColor: "rgb(var(--color-border))",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <DrawerHeader className="shrink-0 px-4 pb-3 pt-3 text-center">
          <DrawerDescription className="sr-only">
            Edit your profile name, username, bio, and website.
          </DrawerDescription>
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 px-2 font-semibold"
              style={{
                color: "rgb(var(--color-text-muted))",
                fontSize: "var(--text-sm)",
              }}
            >
              Cancel
            </Button>
            <DrawerTitle
              className="font-bold"
              style={{
                color: "rgb(var(--color-text))",
                fontSize: "var(--text-base)",
              }}
            >
              Edit profile
            </DrawerTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={loading || usernameState === "taken"}
              className="h-9 px-2 font-semibold"
              style={{
                color: "rgb(var(--brand-primary))",
                fontSize: "var(--text-sm)",
              }}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </DrawerHeader>

        <div
          className="shrink-0"
          style={{ height: 1, backgroundColor: "rgb(var(--color-border))" }}
        />

        <div
          data-vaul-no-drag
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4"
          style={{ paddingBottom: "calc(var(--safe-bottom) + 1rem)" }}
        >
          {fields.map((field) => {
            const value = form[field.name];
            const isUsername = field.name === "username";

            return (
              <div key={field.name} className="flex flex-col gap-1.5">
                <label
                  className="font-semibold uppercase"
                  style={{
                    color: "rgb(var(--color-text-muted))",
                    fontSize: "var(--text-xs)",
                  }}
                >
                  {field.label}
                </label>

                {field.multiline ? (
                  <Textarea
                    value={value}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [field.name]: event.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    rows={3}
                    className="min-h-24 resize-none border-border bg-surface text-[length:var(--text-md)] shadow-none"
                    style={{
                      color: "rgb(var(--color-text))",
                    }}
                  />
                ) : (
                  <div className="relative">
                    {isUsername && (
                      <span
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                        style={{
                          color: "rgb(var(--color-text-muted))",
                          fontSize: "var(--text-sm)",
                        }}
                      >
                        @
                      </span>
                    )}
                    <Input
                      type={field.name === "website" ? "url" : "text"}
                      value={value}
                      onChange={(event) =>
                        isUsername
                          ? handleUsernameChange(event.target.value)
                          : setForm((current) => ({
                              ...current,
                              [field.name]: event.target.value,
                            }))
                      }
                      placeholder={field.placeholder}
                      maxLength={field.maxLength}
                      className="h-11 border-border bg-surface text-[length:var(--text-md)] shadow-none"
                      style={{
                        border: `1px solid ${
                          isUsername && usernameState === "taken"
                            ? "rgb(var(--color-error))"
                            : isUsername && usernameState === "available"
                              ? "rgb(var(--color-success))"
                              : "rgb(var(--color-border))"
                        }`,
                        color: "rgb(var(--color-text))",
                        paddingLeft: isUsername ? "1.75rem" : undefined,
                      }}
                    />
                    {isUsername && usernameState !== "idle" && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {usernameState === "checking" && (
                          <Loader2
                            size={16}
                            className="animate-spin"
                            style={{ color: "rgb(var(--color-text-muted))" }}
                            aria-hidden
                          />
                        )}
                        {usernameState === "available" && (
                          <Check
                            size={16}
                            strokeWidth={2.5}
                            style={{ color: "rgb(var(--color-success))" }}
                            aria-hidden
                          />
                        )}
                        {usernameState === "taken" && (
                          <X
                            size={16}
                            strokeWidth={2.5}
                            style={{ color: "rgb(var(--color-error))" }}
                            aria-hidden
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {isUsername && (
                  <p
                    style={{
                      color:
                        usernameState === "taken"
                          ? "rgb(var(--color-error))"
                          : usernameState === "available"
                            ? "rgb(var(--color-success))"
                            : "rgb(var(--color-text-muted))",
                      fontSize: "var(--text-xs)",
                    }}
                  >
                    {usernameState === "taken"
                      ? "That username is taken"
                      : usernameState === "available"
                        ? "Username is available"
                        : "Letters, numbers, dots and underscores"}
                  </p>
                )}

                {field.multiline && (
                  <p
                    className="text-right"
                    style={{
                      color: "rgb(var(--color-text-muted))",
                      fontSize: "var(--text-xs)",
                    }}
                  >
                    {value.length}/{field.maxLength}
                  </p>
                )}
              </div>
            );
          })}

          {error && (
            <p
              style={{
                color: "rgb(var(--color-error))",
                fontSize: "var(--text-sm)",
              }}
            >
              {error.message}
            </p>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
