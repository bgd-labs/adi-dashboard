"use client";

import { useState } from "react";
import { type Address, type Hex } from "viem";

import { Box } from "@/components/Box";
import { Checkbox } from "@/components/Checkbox";
import { RetryEnvelopeButton } from "@/components/TestTxButtons/RetryEnvelopeButton";
import { RetryTransactionButton } from "@/components/TestTxButtons/RetryTransactionButton";
import { type RouterOutput } from "@/server/api/types";

import { ChainIcon } from "./ChainIcon";

type Props = {
  failedAdapters: RouterOutput["envelopes"]["getBridgingState"]["failedAdapters"];
  envelope: RouterOutput["envelopes"]["get"];
};

export const RetryButtons = ({ failedAdapters, envelope }: Props) => {
  const [adapters, setAdapters] = useState<
    { chainId: number; address: string; encoded_transaction: string }[]
  >([]);

  const handleCheckedChange = ({
    chainId,
    address,
    encoded_transaction,
    checked,
  }: {
    chainId: number;
    address: string;
    encoded_transaction: string;
    checked: boolean;
  }) => {
    if (checked) {
      setAdapters((prevAdapters) => [
        ...prevAdapters,
        { chainId, address, encoded_transaction },
      ]);
    } else {
      setAdapters((prevAdapters) =>
        prevAdapters.filter(
          (a) =>
            a.chainId !== chainId &&
            a.address !== address &&
            a.encoded_transaction !== encoded_transaction,
        ),
      );
    }
  };

  const formattedAdapters: Record<number, Record<string, string[]>> = {};
  adapters.forEach((adapter) => {
    formattedAdapters[adapter.chainId] = {
      [adapter.encoded_transaction]: [
        ...(formattedAdapters[adapter.chainId]
          ? formattedAdapters[adapter.chainId]![adapter.encoded_transaction]!
          : []),
        adapter.address,
      ],
    };
  });

  // TODO: need restyling

  return (
    <Box type="danger">
      <div className="flex flex-wrap items-center justify-start gap-4 px-4 py-6 sm:px-6">
        {failedAdapters?.length !== 0 && (
          <div>
            <h3>Failed Adapters</h3>
            <div className="grid gap-3 pb-4">
              {failedAdapters?.map((adapter) => (
                <Checkbox
                  key={adapter.address}
                  id={adapter.address!}
                  onCheckedChange={(value) =>
                    handleCheckedChange({
                      chainId: adapter.txChainId!,
                      address: adapter.address!,
                      encoded_transaction: adapter.encoded_transaction!,
                      checked: value,
                    })
                  }
                >
                  <div className="flex items-center gap-2 text-sm">
                    <ChainIcon chainId={adapter.chainId} />
                    <div className="font-semibold">{adapter.name}</div>
                    <div className="truncate font-mono text-brand-500">
                      {adapter.address}
                    </div>
                  </div>
                </Checkbox>
              ))}
            </div>

            {Object.entries(formattedAdapters).map((value) => {
              const chainId = Number(value[0]);
              const encoded_transactions = Object.entries(value[1]).map(
                (enctx) => {
                  return {
                    encoded_transaction: enctx[0] as Hex,
                    adapters: enctx[1]
                      .map((address) => address as Address)
                      .filter(
                        (value, index, self) => self.indexOf(value) === index,
                      ),
                  };
                },
              );

              return encoded_transactions.map((item) => (
                <RetryTransactionButton
                  key={item.encoded_transaction}
                  chainId={chainId}
                  encodedTransaction={item.encoded_transaction}
                  bridgeAdaptersToRetry={item.adapters}
                />
              ));
            })}
          </div>
        )}

        <RetryEnvelopeButton
          chainId={envelope.origin_chain_id!}
          envelope={{
            nonce: BigInt(envelope.nonce!),
            origin: envelope.origin! as Hex,
            destination: envelope.destination! as Hex,
            originChainId: BigInt(envelope.origin_chain_id!),
            destinationChainId: BigInt(envelope.destination_chain_id!),
            message: envelope.message,
          }}
        />
      </div>
    </Box>
  );
};
