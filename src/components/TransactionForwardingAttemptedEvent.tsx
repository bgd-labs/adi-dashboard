import { EventListItem } from "@/components/EventListItem";
import { CopyValueCard } from "@/components/CopyValueCard";
import { type RouterOutput } from "@/server/api/types";
import { ExplorerLink } from "./ExplorerLink";

type TransactionForwardingAttemptedEventProps = {
  event: RouterOutput["events"]["getForwardingAttemptEvents"][0];
};

export const TransactionForwardingAttemptedEvent = ({
  event,
}: TransactionForwardingAttemptedEventProps) => {
  return (
    <EventListItem event={event} type="TransactionForwardingAttempted">
      <div className="grid items-center gap-2 border bg-white p-4 text-sm md:grid-cols-6">
        <div className="font-semibold md:pl-0">Transaction hash:</div>
        <div className="md:col-span-5">
          <ExplorerLink
            value={event.transaction_hash}
            type="tx"
            chainId={event.chain_id!}
          />
        </div>
        <div className="font-semibold md:pl-0">Timestamp:</div>
        <div className="md:col-span-5">
          <CopyValueCard value={event.timestamp} />
        </div>
        <div className="font-semibold md:pl-0">Block number:</div>
        <div className="md:col-span-5">
          <CopyValueCard value={event.block_number} />
        </div>
        <hr className="md:col-span-6" />
        <div className="font-semibold md:pl-0">Chain id:</div>
        <div className="md:col-span-5">
          <CopyValueCard value={event.chain_id} />
        </div>
        <div className="font-semibold md:pl-0">Destination chain id:</div>
        <div className="md:col-span-5">
          <CopyValueCard value={event.destination_chain_id} />
        </div>
        <div className="font-semibold md:pl-0">Bridge adapter:</div>
        <div className="md:col-span-5">
          <ExplorerLink
            value={event.bridge_adapter!}
            type="address"
            chainId={event.chain_id!}
          />
        </div>
        <div className="font-semibold md:pl-0">Destination bridge adapter:</div>
        <div className="md:col-span-5">
          <ExplorerLink
            value={event.destination_bridge_adapter!}
            type="address"
            chainId={event.destination_chain_id!}
          />
        </div>

        <div className="font-semibold md:pl-0">Transaction id:</div>
        <div className="md:col-span-5">
          <div className="hidden lg:block">
            <CopyValueCard value={event.transaction_id} />
          </div>
          <div className="lg:hidden">
            <CopyValueCard value={event.transaction_id} isShort />
          </div>
        </div>
        <div className="font-semibold md:pl-0">Adapter successful:</div>
        <div className="md:col-span-5">
          <CopyValueCard value={String(event.adapter_successful)} />
        </div>
        <div className="font-semibold md:pl-0">Return data:</div>
        <div className="md:col-span-5">
          <CopyValueCard
            value={Buffer.from(event.return_data!.slice(2), "hex").toString(
              "utf8",
            )}
            isShort
          />
        </div>
        <div className="font-semibold md:pl-0">Encoded transaction:</div>
        <div className="md:col-span-5">
          <CopyValueCard
            value={Buffer.from(
              event.encoded_transaction!.slice(2),
              "hex",
            ).toString("utf8")}
            isShort
          />
        </div>
      </div>
    </EventListItem>
  );
};
