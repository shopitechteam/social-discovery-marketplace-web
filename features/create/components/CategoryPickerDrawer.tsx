"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { CategoriesDocument } from "@/types/__generated__/graphql";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useIsDesktop } from "@/hooks/useIsDesktop";

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
  const isDesktop = useIsDesktop({ ssrDefault: false });
  const { data, loading } = useQuery(CategoriesDocument, {
    fetchPolicy: "cache-and-network",
  });

  const categories = useMemo(() => data?.categories ?? [], [data?.categories]);
  const selected = categories.find((category) => category.id === value);
  const selectedLabel =
    selected?.name ?? fallbackLabel ?? (value ? "Selected category" : "Choose category");

  function selectCategory(id: string) {
    const category = categories.find((item) => item.id === id);
    if (!category) return;
    onChange(category.id, category.name);
    setOpen(false);
  }

  const triggerButton = (
    <button
      type="button"
      className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left outline-none transition-colors"
      style={{
        backgroundColor: "rgb(var(--color-bg-subtle))",
        border: "1px solid rgb(var(--color-border))",
      }}
    >
      <span className="min-w-0 flex-1">
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
      <ChevronRight
        className="h-5 w-5 shrink-0"
        style={{ color: "rgb(var(--color-text-muted))" }}
      />
    </button>
  );

  const pickerList = loading && categories.length === 0 ? (
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
  ) : categories.length === 0 ? (
    <div
      className="flex h-32 items-center justify-center text-center"
      style={{
        color: "rgb(var(--color-text-muted))",
        fontSize: "var(--text-sm)",
      }}
    >
      No active categories available right now.
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
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
        <DialogContent
          className="w-[min(92vw,760px)] max-w-none gap-0 overflow-hidden rounded-3xl border border-[rgb(229_231_235)] bg-app p-0"
        >
          <DialogHeader className="border-b border-[rgb(229_231_235)] px-6 py-5 text-left">
            <DialogTitle
              style={{
                color: "rgb(var(--color-text))",
                fontSize: "var(--text-lg)",
              }}
            >
              Category
            </DialogTitle>
            <DialogDescription className="sr-only">
              Select a post category.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[min(68vh,560px)] px-6 py-4">
            {pickerList}
          </ScrollArea>

          <DialogFooter className="border-t border-[rgb(229_231_235)] px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>

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
          {pickerList}
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
