"use client";

import {
  IconVariant,
  Web3IconType,
} from "@bgd-labs/react-web3-icons/dist/utils/index";
import React, { useState } from "react";
import { mainnet } from "viem/chains";

import { Box } from "@/components/Box";
import { Web3Icon } from "@/components/Web3Icon";
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
            <Web3Icon
              iconInfo={{
                type: Web3IconType.chain,
                info: {
                  chainId: event.chain_id ?? mainnet.id,
                  variant: IconVariant.Full,
                },
              }}
            />
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
