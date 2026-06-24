"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { Check, ChevronRight, Loader2, Tags } from "lucide-react";
import { CategoriesDocument } from "@/types/__generated__/graphql";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

type CategoryPickerDrawerProps = {
  value: string | null;
  fallbackLabel?: string | null;
  onChange: (id: string, name: string) => void;
};

export function CategoryPickerDrawer({
  value,
  fallbackLabel,
  onChange,
}: CategoryPickerDrawerProps) {
  const [open, setOpen] = useState(false);
  const { data, loading } = useQuery(CategoriesDocument, {
    fetchPolicy: "cache-and-network",
  });

  const categories = useMemo(() => data?.categories ?? [], [data?.categories]);
  const selected = categories.find((category) => category.id === value);
  const selectedLabel =
    selected?.name ?? fallbackLabel ?? (value ? "Selected category" : "Choose category");
  const selectedIcon = selected?.icon ?? null;

  function selectCategory(id: string) {
    const category = categories.find((item) => item.id === id);
    if (!category) return;
    onChange(category.id, category.name);
    setOpen(false);
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left outline-none transition-colors"
          style={{
            backgroundColor: "rgb(var(--color-bg-subtle))",
            border: "1px solid rgb(var(--color-border))",
          }}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: "rgb(var(--brand-primary) / 0.12)",
                color: "rgb(var(--brand-primary))",
              }}
            >
              {selectedIcon ? (
                <span style={{ fontSize: "var(--text-base)" }}>{selectedIcon}</span>
              ) : (
                <Tags className="h-4 w-4" />
              )}
            </span>
            <span className="min-w-0">
              <span
                className="block truncate font-medium"
                style={{
                  color: value
                    ? "rgb(var(--color-text))"
                    : "rgb(var(--color-text-placeholder))",
                  fontSize: "var(--text-base)",
                }}
              >
                {selectedLabel}
              </span>
              {value && (
                <span
                  className="block truncate"
                  style={{
                    color: "rgb(var(--color-text-muted))",
                    fontSize: "var(--text-xs)",
                  }}
                >
                  Selected
                </span>
              )}
            </span>
          </span>
          <ChevronRight
            className="h-5 w-5 shrink-0"
            style={{ color: "rgb(var(--color-text-muted))" }}
          />
        </button>
      </DrawerTrigger>

      <DrawerContent
        className="max-h-[84vh] border-default bg-app"
        style={{ borderColor: "rgb(var(--color-border))" }}
      >
        <DrawerHeader className="px-5 text-left">
          <DrawerTitle
            style={{
              color: "rgb(var(--color-text))",
              fontSize: "var(--text-lg)",
            }}
          >
            Category
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            Select a post category.
          </DrawerDescription>
        </DrawerHeader>

        <ScrollArea className="h-[52vh] px-5">
          {loading && categories.length === 0 ? (
            <div
              className="flex h-32 items-center justify-center gap-2"
              style={{
                color: "rgb(var(--color-text-muted))",
                fontSize: "var(--text-sm)",
              }}
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading categories...
            </div>
          ) : (
            <RadioGroup
              value={value ?? ""}
              onValueChange={selectCategory}
              className="gap-2 pb-2"
            >
              {categories.map((category) => {
                const checked = category.id === value;
                return (
                  <div
                    key={category.id}
                    onClick={() => selectCategory(category.id)}
                    className="flex min-h-[56px] cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5"
                    style={{
                      backgroundColor: checked
                        ? "rgb(var(--brand-primary) / 0.1)"
                        : "rgb(var(--color-bg-subtle))",
                      border: checked
                        ? "1px solid rgb(var(--brand-primary) / 0.35)"
                        : "1px solid rgb(var(--color-border))",
                    }}
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: checked
                          ? "rgb(var(--brand-primary) / 0.16)"
                          : "rgb(var(--color-bg-elevated))",
                        color: "rgb(var(--brand-primary))",
                      }}
                    >
                      {category.icon ? (
                        <span style={{ fontSize: "var(--text-base)" }}>
                          {category.icon}
                        </span>
                      ) : (
                        <Tags className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className="block truncate font-medium"
                        style={{
                          color: "rgb(var(--color-text))",
                          fontSize: "var(--text-sm)",
                        }}
                      >
                        {category.name}
                      </span>
                      {category.description && (
                        <span
                          className="line-clamp-1"
                          style={{
                            color: "rgb(var(--color-text-muted))",
                            fontSize: "var(--text-xs)",
                          }}
                        >
                          {category.description}
                        </span>
                      )}
                    </span>
                    {checked && (
                      <Check
                        className="h-4 w-4 shrink-0"
                        style={{ color: "rgb(var(--brand-primary))" }}
                      />
                    )}
                    <RadioGroupItem value={category.id} className="shrink-0" />
                  </div>
                );
              })}
            </RadioGroup>
          )}
        </ScrollArea>

        <DrawerFooter className="px-5">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Done
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
