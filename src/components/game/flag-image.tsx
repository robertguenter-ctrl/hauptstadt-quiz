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
  lg: "h-48 w-48",
  sm: "h-16 w-16",
  tile: "h-16 w-16",
};

export function FlagImage({ isoCode, size = "lg", className, alt = "" }: FlagImageProps) {
  const sources = flagSources(isoCode);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  if (failed || sourceIndex >= sources.length) {
    return (
      <span
        className={cn(
          "flex items-center justify-center rounded-xl border border-white/20 bg-white/5 shadow-2xl",
          sizeClasses[size],
          size === "lg" ? "text-8xl" : "text-5xl",
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
        "rounded-xl border border-white/20 object-cover shadow-2xl",
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
