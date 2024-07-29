"use client";

import React, { useState } from "react";

import { Box } from "@/components/Box";
import { ChainIcon } from "@/components/ChainIcon";
import { type RouterOutput } from "@/server/api/types";

import { Timestamp } from "./Timestamp";

type EventType =
  | "EnvelopeRegistered"
  | "TransactionForwardingAttempted"
  | "TransactionReceived"
  | "EnvelopeDeliveryAttempted";

type EventMap = {
  EnvelopeRegistered: RouterOutput["events"]["getRegisteredEvents"][0];
  TransactionForwardingAttempted: RouterOutput["events"]["getForwardingAttemptEvents"][0];
  TransactionReceived: RouterOutput["events"]["getTransactionReceivedEvents"][0];
  EnvelopeDeliveryAttempted: RouterOutput["events"]["getDeliveryAttemptEvents"][0];
};

type EventListItemProps<T extends EventType> = {
  type: T;
  event: EventMap[T];
  children: React.ReactNode;
};

export const EventListItem = ({
  type,
  event,
  children,
}: EventListItemProps<EventType>) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <Box isHoverable>
        <button
          className="block w-full cursor-pointer px-4 py-4 sm:px-6"
          onClick={() => setIsCollapsed((prev) => !prev)}
        >
          <span className="flex items-center gap-2 sm:gap-4">
            <ChainIcon chainId={event.chain_id} />
            <span className="truncate text-sm font-semibold text-brand-900">
              {type}
            </span>
            <span className="ml-auto shrink-0 text-right">
              <Timestamp value={event.timestamp} />
            </span>
          </span>
        </button>
      </Box>

      {isCollapsed && <Box className="bg-brand-100 px-6 py-4">{children}</Box>}
    </>
  );
};
