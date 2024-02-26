"use client";

import { useEffect, useState } from 'react';
import { Tooltip } from "./Tooltip";
import { cn } from "@/utils/cn";

export const Timestamp = ({ value }: { value: string | null }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!value) {
    return null;
  }

  const date = isMounted
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    : new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "UTC",
      });

  return (
    <Tooltip value={isMounted ? "Local time" : "Server time"}>
      <time
        dateTime={new Date(value).toISOString()}
        className={cn("text-sm text-brand-900 opacity-20 transition-all", {
          ["opacity-60"]: isMounted,
        })}
      >
        {date}
      </time>
    </Tooltip>
  );
};