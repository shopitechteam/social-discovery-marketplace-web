"use client";

interface Props {
  amount: number;
  currency: string;
  negotiable: boolean;
  inverted?: boolean; // white pill on dark bg (video overlay)
}

export function PriceTag({ amount, currency, negotiable, inverted }: Props) {
  const display =
    amount === 0
      ? "Free"
      : `${currency} ${(amount).toLocaleString()}`;

  if (inverted) {
    return (
      <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
        {display}
        {negotiable && <span className="text-[10px] opacity-75">· neg</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">
      {display}
      {negotiable && <span className="text-[10px] opacity-80">· neg</span>}
    </span>
  );
}
