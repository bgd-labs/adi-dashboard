import { EventListItem } from "@/components/EventListItem";
import { CopyValueCard } from "@/components/CopyValueCard";
import { ExplorerLink } from "@/components/ExplorerLink";
import { BridgeExplorerLink } from "./BridgeExplorerLink";
import { type RouterOutput } from "@/server/api/types";

type TransactionReceivedEventProps = {
  event: RouterOutput["events"]["getTransactionReceivedEvents"][0];
};

export const TransactionReceivedEvent = ({
  event,
}: TransactionReceivedEventProps) => {
  return (
    <EventListItem event={event} type="TransactionReceived">
      <BridgeExplorerLink
        txHash={event.transaction_hash}
        chainId={event.chain_id!}
        address={event.bridge_adapter!}
      />
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
        <div className="font-semibold md:pl-0">Origin chain id:</div>
        <div className="md:col-span-5">
          <CopyValueCard value={event.origin_chain_id} />
        </div>
        <div className="font-semibold md:pl-0">Chain id:</div>
        <div className="md:col-span-5">
          <CopyValueCard value={event.chain_id} />
        </div>
        <div className="font-semibold md:pl-0">Bridge adapter:</div>
        <div className="md:col-span-5">
          <ExplorerLink
            value={event.bridge_adapter!}
            type="address"
            chainId={event.chain_id!}
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
        <div className="font-semibold md:pl-0">Confirmations:</div>
        <div className="md:col-span-5">
          <CopyValueCard value={event.confirmations} />
        </div>
        <div className="font-semibold md:pl-0">Nonce:</div>
        <div className="md:col-span-5">
          <CopyValueCard value={event.nonce} />
        </div>
        <div className="font-semibold md:pl-0">Encoded envelope:</div>
        <div className="md:col-span-5">
          <CopyValueCard
            value={Buffer.from(
              event.encoded_envelope!.slice(2),
              "hex",
            ).toString("utf8")}
            isShort
          />
        </div>
      </div>
    </EventListItem>
  );
};
