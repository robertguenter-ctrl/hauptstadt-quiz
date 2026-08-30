"use client";

import { useState } from "react";
import { cn, flagEmoji, flagSources } from "@/lib/utils";

interface FlagImageProps {
  isoCode: string;
  size?: "sm" | "lg" | "tile";
  className?: string;
  alt?: string;
}

const sizeClasses = {
  lg: "h-36 w-auto aspect-[3/2]",
  sm: "h-12 w-auto aspect-[3/2]",
  tile: "h-12 w-auto aspect-[3/2]",
};

export function FlagImage({ isoCode, size = "lg", className, alt = "" }: FlagImageProps) {
  const sources = flagSources(isoCode);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  if (failed || sourceIndex >= sources.length) {
    return (
      <span
        className={cn(
          "flex items-center justify-center rounded-md border border-white/20 bg-white/5 shadow-lg",
          sizeClasses[size],
          size === "lg" ? "text-7xl" : "text-4xl",
          className,
        )}
        aria-label={alt}
      >
        {flagEmoji(isoCode)}
      </span>
    );
  }

  return (
    <img
      src={sources[sourceIndex]}
      alt={alt}
      referrerPolicy="no-referrer"
      className={cn(
        "rounded-md border border-white/20 bg-white/5 object-contain shadow-lg",
        sizeClasses[size],
        className,
      )}
      onError={() => {
        if (sourceIndex < sources.length - 1) {
          setSourceIndex((i) => i + 1);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}
