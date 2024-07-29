import Link from "next/link";

import { Box } from "@/components/Box";
import { Consensus } from "@/components/Consensus";
import { EnvelopeIcon } from "@/components/EnvelopeIcon";
import { FromTo } from "@/components/FromTo";
import { Timestamp } from "@/components/Timestamp";
import { type RouterOutput } from "@/server/api/types";

export const EnvelopeListItem = ({
  envelope,
}: {
  envelope: RouterOutput["envelopes"]["getAll"]["data"][0];
}) => {
  const firstEight = envelope.id.slice(0, 8);

  return (
    <Box isHoverable>
      <Link href={`/envelope/${envelope.id}`}>
        <div className="cursor-pointer px-6 py-5">
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            <EnvelopeIcon seed={envelope.id} />
            <div className="font-mono text-xs leading-none text-brand-500">
              {firstEight}...
            </div>
            <div className="hidden text-sm font-semibold text-brand-900 md:block lg:w-44 xl:w-52">
              {envelope.decodedMessage?.type ?? (
                <span className="text-brand-500">Unknown type</span>
              )}
            </div>
            <div className="hidden gap-2 lg:flex">
              {envelope.proposal_id !== null &&
                envelope.proposal_id !== undefined && (
                  <div className="flex truncate font-mono text-xs font-normal text-brand-900 opacity-60">
                    <div className="w-22 border border-brand-300 bg-brand-300 p-1">
                      proposalId
                    </div>
                    <div className="w-10 truncate border border-brand-300 p-1 text-center">
                      {envelope.proposal_id}
                    </div>
                  </div>
                )}
              {envelope.payload_id !== null &&
                envelope.payload_id !== undefined && (
                  <div className="flex truncate font-mono text-xs font-normal text-brand-900 opacity-60">
                    <div className="w-22 border border-brand-300 bg-brand-300 p-1">
                      payloadId
                    </div>
                    <div className="w-10 truncate border border-brand-300 p-1 text-center">
                      {envelope.payload_id}
                    </div>
                  </div>
                )}
            </div>

            <div className="ml-auto flex items-center gap-4">
              <Consensus
                value={envelope.confirmations}
                config={envelope.consensus}
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
              <FromTo
                from={envelope.origin_chain_id}
                to={envelope.destination_chain_id}
              />
              <div className="hidden text-right md:block md:w-40">
                <Timestamp value={envelope.registered_at} />
              </div>
            </div>
          </div>
          <div className="mt-6 text-left md:hidden">
            <div className="text-sm font-semibold leading-none">
              {envelope.decodedMessage?.type ?? "unknown type"}
            </div>
            <div className="mt-4 flex gap-2">
              {envelope.payload_id && (
                <div className="flex truncate font-mono text-xs font-normal text-brand-900 opacity-60">
                  <div className="border border-brand-300 bg-brand-300 p-1">
                    payloadId
                  </div>
                  <div className="w-10 truncate border border-brand-300 p-1 text-center">
                    {envelope.payload_id}
                  </div>
                </div>
              )}
              {envelope.proposal_id && (
                <div className="flex truncate font-mono text-xs font-normal text-brand-900 opacity-60">
                  <div className="border border-brand-300 bg-brand-300 p-1">
                    proposalId
                  </div>
                  <div className="w-10 truncate border border-brand-300 p-1 text-center">
                    {envelope.proposal_id}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-2">
              <Timestamp value={envelope.registered_at} />
            </div>
          </div>
        </div>
      </Link>
    </Box>
  );
};
