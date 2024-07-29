import { CopyValueCard } from "@/components/CopyValueCard";
import { EventListItem } from "@/components/EventListItem";
import { ExplorerLink } from "@/components/ExplorerLink";
import { type RouterOutput } from "@/server/api/types";

type EnvelopeDeliveryAttemptedEventProps = {
  event: RouterOutput["events"]["getDeliveryAttemptEvents"][0];
};

export const EnvelopeDeliveryAttemptedEvent = ({
  event,
}: EnvelopeDeliveryAttemptedEventProps) => {
  return (
    <EventListItem event={event} type="EnvelopeDeliveryAttempted">
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
        <div className="font-semibold md:pl-0">Is delivered:</div>
        <div className="md:col-span-5">
          <CopyValueCard value={String(event.is_delivered)} />
        </div>
      </div>
    </EventListItem>
  );
};
