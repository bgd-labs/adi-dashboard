import { notFound } from "next/navigation";
import { EnvelopeIcon } from "@/components/EnvelopeIcon";
import { CopyValueCard } from "@/components/CopyValueCard";
import { FromTo } from "@/components/FromTo";
import { ExplorerLink } from "@/components/ExplorerLink";
import { api } from "@/trpc/server";
import { Box } from "@/components/Box";
import { EnvelopeRegisteredEvent } from "@/components/EnvelopeRegisteredEvent";
import { TransactionForwardingAttemptedEvent } from "@/components/TransactionForwardingAttemptedEvent";
import { TransactionReceivedEvent } from "@/components/TransactionReceivedEvent";
import { EnvelopeDeliveryAttemptedEvent } from "@/components/EnvelopeDeliveryAttemptedEvent";
import { EnvelopeMessage } from "@/components/EnvelopeMessage";
import { type Hex } from "viem";
import { cn } from "@/utils/cn";

const EnvelopeDetailPage = async ({
  params,
}: {
  params: { envelopeId: string };
}) => {
  try {
    const envelope = await api.envelopes.get.query({
      envelopeId: params.envelopeId,
    });

    const registeredEvents = await api.events.getRegisteredEvents.query({
      envelopeId: params.envelopeId,
    });
    const forwardingAttemptEvents =
      await api.events.getForwardingAttemptEvents.query({
        envelopeId: params.envelopeId,
      });
    const transactionReceivedEvents =
      await api.events.getTransactionReceivedEvents.query({
        envelopeId: params.envelopeId,
      });
    const deliveryAttemptEvents =
      await api.events.getDeliveryAttemptEvents.query({
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

    return (
      <>
        <Box>
          <div className="px-4 py-2 py-6 sm:px-6">
            <div className="flex items-center gap-1 sm:gap-3">
              <EnvelopeIcon isBig seed={envelope.id} />
              <div className="hidden translate-y-1 sm:block">
                <h2 className="mb-1 pl-0.5 text-xs font-semibold uppercase tracking-wider">
                  Envelope ID
                </h2>
                <div className="flex hidden xl:block">
                  <CopyValueCard value={params.envelopeId} isBig />
                </div>
                <div className="xl:hidden">
                  <CopyValueCard value={params.envelopeId} isBig isShort />
                </div>
              </div>
              <div className="ml-auto">
                <FromTo
                  from={envelope.origin_chain_id}
                  to={envelope.destination_chain_id}
                  isBig
                />
              </div>
            </div>
            <div className="mt-4 sm:hidden">
              <h2 className="pl-0.5 text-xs font-semibold uppercase tracking-wider">
                Envelope ID
              </h2>
              <div className="flex hidden xl:block">
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
            <EnvelopeMessage
              chainId={envelope.destination_chain_id!}
              decodedMessage={envelope.decodedMessage}
              payloadsControllerAddress={envelope.destination! as Hex}
              message={envelope.message}
            />
          </div>
        </Box>
        <Box>
          <div className="px-4 py-2 py-6 sm:px-6">
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
                          "rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-500 ml-auto sm:ml-0",
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
                    const isDelivered = deliveryAttemptEvents.some(
                      (attempt) => attempt.is_delivered,
                    );
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
                    const oneHourAgo = new Date();
                    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

                    if (registeredAt > oneHourAgo && !isDelivered) {
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
                        className="flex items-center"
                      >
                        <ExplorerLink
                          type="address"
                          chainId={envelope.destination_chain_id!}
                          value={event.destination_bridge_adapter!}
                          skipAdapter
                        />
                        <div
                          className={cn(
                            "rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-500 ml-auto sm:ml-0",
                            {
                              ["bg-green-100 text-green-700"]:
                                status === "Success",
                              ["bg-red-100 text-red-700"]: status === "Failed",
                            },
                          )}
                        >
                          {status}
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

export const revalidate = 30;
