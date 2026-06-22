import type {
  DetailedHTMLProps,
  HTMLAttributes,
} from "react";

type TiktokVideoAttributes = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  src?: string;
  controls?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "tiktok-video": TiktokVideoAttributes;
    }
  }
}

export {};
