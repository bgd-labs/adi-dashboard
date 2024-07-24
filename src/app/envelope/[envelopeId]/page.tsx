import { notFound } from "next/navigation";
// eslint-disable-next-line import/default
import prettyMilliseconds from "pretty-ms";
import { formatEther, formatGwei, type Hex } from "viem";

import { Box } from "@/components/Box";
import { Consensus } from "@/components/Consensus";
import { CopyValueCard } from "@/components/CopyValueCard";
import { EnvelopeDeliveryAttemptedEvent } from "@/components/EnvelopeDeliveryAttemptedEvent";
import { EnvelopeGovernanceLinks } from "@/components/EnvelopeGovernanceLinks";
import { EnvelopeIcon } from "@/components/EnvelopeIcon";
import { EnvelopeMessage } from "@/components/EnvelopeMessage";
import { EnvelopeRegisteredEvent } from "@/components/EnvelopeRegisteredEvent";
import { ExplorerLink } from "@/components/ExplorerLink";
import { FromTo } from "@/components/FromTo";
import { Timestamp } from "@/components/Timestamp";
import { Tooltip } from "@/components/Tooltip";
import { TransactionForwardingAttemptedEvent } from "@/components/TransactionForwardingAttemptedEvent";
import { TransactionReceivedEvent } from "@/components/TransactionReceivedEvent";
import { api } from "@/trpc/server";
import { cn } from "@/utils/cn";
import { truncateToTwoSignificantDigits } from "@/utils/truncateToTwoSignificantDigits";

const SKIPPED_STATUS_TIMEOUT_HOURS = 10;

const EnvelopeDetailPage = async ({
  params,
}: {
  params: { envelopeId: string };
}) => {
  try {
    const envelope = await api.envelopes.get({
      envelopeId: params.envelopeId,
    });

    const registeredEvents = await api.events.getRegisteredEvents({
      envelopeId: params.envelopeId,
    });
    const forwardingAttemptEvents = await api.events.getForwardingAttemptEvents(
      {
        envelopeId: params.envelopeId,
      },
    );
    const transactionReceivedEvents =
      await api.events.getTransactionReceivedEvents({
        envelopeId: params.envelopeId,
      });
    const deliveryAttemptEvents = await api.events.getDeliveryAttemptEvents({
      envelopeId: params.envelopeId,
    });

    const sortedEvents = [...forwardingAttemptEvents].sort(
      (a, b) => Number(b.timestamp) - Number(a.timestamp),
    );

    const uniqueForwardingAttemptEvents = sortedEvents.filter(
      (event, index, self) =>
        index ===
        self.findIndex((e) => e.bridge_adapter === event.bridge_adapter),
    );

    const txHashes = forwardingAttemptEvents.map(
      (event) => event.transaction_hash,
    );
    const uniqueTxHashes = txHashes.filter(
      (value, index, self) => self.indexOf(value) === index,
    );

    const bridgingCosts = await api.transactions.getTransactionCosts({
      txHashes: uniqueTxHashes,
    });
    const totalBridgingCostsUSD = bridgingCosts
      .reduce((acc, cost) => acc + cost.value_usd!, 0)
      .toFixed(2);

    const gasCosts = await api.transactions.getGasCosts({
      txHashes: uniqueTxHashes,
    });
    const totalGasCostsUSD = gasCosts
      .reduce((acc, cost) => acc + cost.transaction_fee_usd!, 0)
      .toFixed(2);

    let isMultipleEnvelopes;
    const txHash =
      forwardingAttemptEvents[0]?.transaction_hash ??
      registeredEvents?.[0]?.transaction_hash;
    if (txHash) {
      isMultipleEnvelopes = await api.transactions.checkMultiEnvelope(txHash);
    }

    const deliveryTimes = transactionReceivedEvents.map((receivedEvent) => {
      const forwardingEvent = forwardingAttemptEvents.find(
        (e) => e.destination_bridge_adapter === receivedEvent.bridge_adapter,
      );
      if (!forwardingEvent) {
        return null;
      }

      const forwardingTimestamp = new Date(forwardingEvent.timestamp!);
      const receivedTimestamp = new Date(receivedEvent.timestamp!);

      if (forwardingTimestamp && receivedTimestamp) {
        const timeDifference =
          receivedTimestamp.getTime() - forwardingTimestamp.getTime();

        return {
          id: receivedEvent.bridge_adapter,
          deliveryTime: prettyMilliseconds(timeDifference, { compact: true }),
        };
      }
    });

    return (
      <>
        <Box>
          <div className="px-4 py-6 sm:px-6">
            <div className="flex items-center gap-1 sm:gap-3">
              <EnvelopeIcon isBig seed={envelope.id} />
              <div className="hidden translate-y-1 sm:block">
                <h2 className="mb-1 pl-0.5 text-xs font-semibold uppercase tracking-wider">
                  Envelope ID
                </h2>
                <CopyValueCard value={params.envelopeId} isBig isShort />
              </div>
              <div className="ml-auto text-right">
                <div className="flex items-center justify-end gap-5">
                  <div className="hidden md:block">
                    <Timestamp value={envelope.registered_at} />
                  </div>
                  <Consensus
                    value={envelope.confirmations}
                    config={envelope.consensus}
                    hideIfSkipped
                  />
                  <div>
                    {envelope.is_delivered && (
                      <svg
                        className="h-5 w-5 text-green-500"
                        viewBox="0 0 50 50"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 25.6939L20.2344 35L43 11"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                      </svg>
                    )}
                    {!envelope.is_delivered && !envelope.is_pending && (
                      <svg
                        className="h-5 w-5 text-red-500"
                        viewBox="0 0 50 50"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M27.6142 24.8615L38.7832 13.0869L35.5289 10L24.523 21.6026L13.5171 10L10.2628 13.0869L21.4318 24.8615L10 36.9131L13.2543 40L24.523 28.1203L35.7917 40L39.046 36.9131L27.6142 24.8615Z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                    {!envelope.is_delivered && envelope.is_pending && (
                      <svg
                        className="h-5 w-5 text-brand-500"
                        viewBox="0 0 50 50"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M25 3C12.8716 3 3 12.8716 3 25C3 37.1284 12.8716 47 25 47C37.1284 47 47 37.1284 47 25C47 12.8716 37.1284 3 25 3ZM25 6.68715C35.1357 6.68715 43.3129 14.8643 43.3129 25C43.3129 35.1357 35.1357 43.3129 25 43.3129C14.8643 43.3129 6.68715 35.1357 6.68715 25C6.68715 14.8643 14.8643 6.68715 25 6.68715Z"
                          fill="currentColor"
                        />
                        <path
                          d="M26.8407 13L22.4554 13.0501L22.5884 25.3934L17 29.2365L19.4325 33L27 27.7964L26.8407 13Z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <FromTo
                      from={envelope.origin_chain_id}
                      to={envelope.destination_chain_id}
                      isBig
                    />
                  </div>
                  <div className="sm:hidden">
                    <FromTo
                      from={envelope.origin_chain_id}
                      to={envelope.destination_chain_id}
                    />
                  </div>
                </div>
                <div className="mt-2 md:hidden">
                  <Timestamp value={envelope.registered_at} />
                </div>
              </div>
            </div>
            <div className="mt-4 sm:hidden">
              <h2 className="pl-0.5 text-xs font-semibold uppercase tracking-wider">
                Envelope ID
              </h2>
              <div className="hidden xl:block">
                <CopyValueCard value={params.envelopeId} isBig />
              </div>
              <div className="xl:hidden">
                <CopyValueCard value={params.envelopeId} isBig isShort />
              </div>
            </div>
          </div>
          <div className="px-4 pb-6 sm:px-6">
            <div className="grid gap-4 border-t pt-5 lg:grid-cols-2">
              <div>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider">
                  Origin
                </h2>
                <ExplorerLink
                  type="address"
                  chainId={envelope.origin_chain_id!}
                  value={envelope.origin!}
                />
              </div>
              <div>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider">
                  Destination
                </h2>
                <ExplorerLink
                  type="address"
                  chainId={envelope.destination_chain_id!}
                  value={envelope.destination!}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <EnvelopeMessage
                chainId={envelope.destination_chain_id!}
                decodedMessage={envelope.decodedMessage}
                payloadsControllerAddress={envelope.destination! as Hex}
                message={envelope.message}
              />
              {(envelope.proposal_id ?? envelope.payload_id) && (
                <EnvelopeGovernanceLinks
                  proposalId={envelope.proposal_id}
                  payloadId={envelope.payload_id}
                  chainId={envelope.destination_chain_id!}
                  payloadsControllerAddress={envelope.destination! as Hex}
                />
              )}
            </div>
          </div>
        </Box>
        <Box>
          <div className="px-4 py-6 sm:px-6">
            {forwardingAttemptEvents.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider">
                    Origin adapters
                  </h2>
                  {uniqueForwardingAttemptEvents.map((event) => (
                    <div
                      key={event.transaction_hash + event.log_index}
                      className="flex items-center gap-1"
                    >
                      <ExplorerLink
                        type="address"
                        chainId={envelope.origin_chain_id!}
                        value={event.bridge_adapter!}
                        skipAdapter
                      />
                      <div
                        className={cn(
                          "ml-auto rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-500 sm:ml-0",
                          {
                            ["bg-green-100 text-green-700"]:
                              event.adapter_successful,
                            ["bg-red-100 text-red-700"]:
                              !event.adapter_successful,
                          },
                        )}
                      >
                        {event.adapter_successful ? "Success" : "Failed"}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid gap-2">
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider">
                    Destination adapters
                  </h2>
                  {uniqueForwardingAttemptEvents.map((event) => {
                    const isDelivered = deliveryAttemptEvents.length > 0;
                    const isSameChain =
                      envelope.origin_chain_id ===
                      envelope.destination_chain_id;
                    const isAdapterSuccessful = forwardingAttemptEvents.some(
                      (e) => e.adapter_successful,
                    );
                    const isDestinationAdapterMatch =
                      transactionReceivedEvents.some(
                        (e) =>
                          e.bridge_adapter === event.destination_bridge_adapter,
                      );

                    let status = "Failed";

                    const registeredAt = new Date(envelope.registered_at!);
                    const timeBeforeTimeout = new Date();
                    timeBeforeTimeout.setHours(
                      timeBeforeTimeout.getHours() -
                        SKIPPED_STATUS_TIMEOUT_HOURS,
                    );

                    if (
                      registeredAt > timeBeforeTimeout &&
                      !isDelivered &&
                      !isDestinationAdapterMatch &&
                      !(isSameChain && isAdapterSuccessful)
                    ) {
                      status = "Pending";
                    } else if (isSameChain && isAdapterSuccessful) {
                      status = "Success";
                    } else if (!isSameChain && isDestinationAdapterMatch) {
                      status = "Success";
                    } else if (event.adapter_successful && isDelivered) {
                      status = "Skipped";
                    }

                    return (
                      <div
                        key={event.transaction_hash + event.log_index}
                        className="flex items-center gap-1"
                      >
                        <ExplorerLink
                          type="address"
                          chainId={envelope.destination_chain_id!}
                          value={event.destination_bridge_adapter!}
                          skipAdapter
                        />
                        <div
                          className={cn(
                            "ml-auto rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-500 sm:ml-0",
                            {
                              ["bg-green-100 text-green-700"]:
                                status === "Success",
                              ["bg-red-100 text-red-700"]: status === "Failed",
                            },
                          )}
                        >
                          {status}
                        </div>
                        <div className="ml-auto hidden font-mono text-xs opacity-40 sm:block">
                          {
                            deliveryTimes.find(
                              (time) =>
                                time?.id === event.destination_bridge_adapter,
                            )?.deliveryTime
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {forwardingAttemptEvents.length === 0 && (
              <div className="py-10 text-center">
                <span className="font-semibold text-red-500">Warning:</span> All
                bridges failed to register the envelope
              </div>
            )}
          </div>
        </Box>
        {(gasCosts.length > 0 || bridgingCosts.length > 0) && (
          <Box>
            <div className="grid gap-4 px-4 py-6 sm:px-6 md:grid-cols-2">
              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider">
                  Transaction costs
                  {isMultipleEnvelopes && (
                    <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-500">
                      Multiple envelopes in TX
                    </span>
                  )}
                </h2>
                <div className="mb-3 text-2xl font-semibold text-brand-900">
                  {totalGasCostsUSD} $
                </div>
                {gasCosts.length > 0 &&
                  gasCosts.map((cost) => (
                    <div
                      className="flex flex-col gap-2"
                      key={cost.transaction_fee}
                    >
                      <div className="text-sm">
                        Transaction fee:
                        <Tooltip
                          value={`${formatEther(
                            BigInt(cost.transaction_fee!),
                          )} ${cost.token_symbol?.toUpperCase()} ${cost.transaction_fee_usd?.toFixed(
                            2,
                          )}$`}
                        >
                          <div className="ml-2 inline-block rounded bg-brand-300 px-1 py-0.5 font-mono text-xs uppercase text-brand-900">
                            {truncateToTwoSignificantDigits(
                              formatEther(BigInt(cost.transaction_fee!)),
                            )}
                            <span className="ml-1 font-semibold opacity-40">
                              {cost.token_symbol}
                            </span>
                          </div>
                        </Tooltip>
                      </div>
                      <div className="text-sm">
                        Gas price:
                        <Tooltip
                          value={`${formatGwei(BigInt(cost.gas_price!))} GWEI`}
                        >
                          <div className="ml-2 inline-block rounded bg-brand-300 px-1 py-0.5 font-mono text-xs uppercase text-brand-900">
                            {truncateToTwoSignificantDigits(
                              formatGwei(BigInt(cost.gas_price!)),
                            )}
                            <span className="ml-1 font-semibold opacity-40">
                              Gwei
                            </span>
                          </div>
                        </Tooltip>
                      </div>
                      <div className="text-sm">
                        <span className="uppercase">{cost.token_symbol}</span>{" "}
                        price on TXN date:
                        <div className="ml-2 inline-block rounded bg-brand-300 px-1 py-0.5 font-mono text-xs uppercase text-brand-900">
                          {cost.token_usd_price?.toFixed(2)}
                          <span className="ml-1 font-semibold opacity-40">
                            $
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <div>
                <h2 className="mb-3 flex items-center text-xs font-semibold uppercase tracking-wider">
                  Bridging costs
                  {isMultipleEnvelopes && (
                    <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-500">
                      Multiple envelopes in TX
                    </span>
                  )}
                </h2>
                <div className="mb-3 text-2xl font-semibold text-brand-900">
                  {totalBridgingCostsUSD} $
                </div>
                {bridgingCosts.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {bridgingCosts.map((cost) => (
                      <div
                        className="flex flex-wrap items-center gap-2"
                        key={cost.value}
                      >
                        <ExplorerLink
                          type="address"
                          value={cost.from}
                          chainId={cost.chain_id!}
                          tiny
                        />
                        <svg
                          className="h-4 w-4 text-brand-500"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M13.75 6.75L19.25 12L13.75 17.25"
                          />
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M19 12H4.75"
                          />
                        </svg>
                        <ExplorerLink
                          type="address"
                          value={cost.to}
                          chainId={cost.chain_id!}
                          tiny
                        />
                        <Tooltip
                          value={`${formatEther(
                            BigInt(cost.value!),
                          )} ${cost.token_symbol?.toUpperCase()} - ${cost.value_usd?.toFixed(
                            2,
                          )} $`}
                        >
                          <div className="rounded bg-brand-300 px-1 py-0.5 font-mono text-xs uppercase text-brand-900">
                            {truncateToTwoSignificantDigits(
                              formatEther(BigInt(cost.value!)),
                            )}
                            <span className="ml-1 font-semibold opacity-40">
                              {cost.token_symbol}
                            </span>
                          </div>
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="px-4 pb-6 text-xs text-brand-500 sm:px-6">
              Price data provided by{" "}
              <a href="https://www.coingecko.com/en/api" className="underline">
                CoinGecko API
              </a>
            </div>
          </Box>
        )}
        {registeredEvents.map((event) => (
          <EnvelopeRegisteredEvent
            key={event.transaction_hash + event.log_index}
            event={event}
          />
        ))}
        {forwardingAttemptEvents.map((event) => (
          <TransactionForwardingAttemptedEvent
            key={event.transaction_hash + event.log_index}
            event={event}
          />
        ))}
        {transactionReceivedEvents.map((event) => (
          <TransactionReceivedEvent
            key={event.transaction_hash + event.log_index}
            event={event}
          />
        ))}
        {deliveryAttemptEvents.map((event) => (
          <EnvelopeDeliveryAttemptedEvent
            key={event.transaction_hash + event.log_index}
            event={event}
          />
        ))}
      </>
    );
  } catch (error) {
    notFound();
  }
};

export default EnvelopeDetailPage;

export const generateStaticParams = async () => {
  const slugs = await api.envelopes.getAllSlugs();

  return slugs.map((slug) => ({
    envelopeId: slug,
  }));
};
