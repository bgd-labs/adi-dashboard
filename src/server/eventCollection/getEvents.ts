import { type PublicClient, type Hash } from "viem";
import { cccEventsAbi } from "../constants/cccEventsAbi";
import { supabaseAdmin } from "@/server/api/supabase/server";
import { revalidatePath } from "next/cache";
import { calculateTxCosts } from "@/server/eventCollection/calculateTxCosts";

export const getEvents = async ({
  address,
  client,
  from,
  to,
  isRetry,
}: {
  address: string;
  client: PublicClient;
  from: number;
  to: number;
  isRetry?: boolean;
}) => {
  try {
    const events = await client.getContractEvents({
      address: address as Hash,
      abi: cccEventsAbi,
      fromBlock: BigInt(from),
      toBlock: BigInt(to),
    });

    if (events.length > 0) {
      console.log(
        `Found ${events.length} events for chain ${client.chain?.id}.`,
      );
      revalidatePath("/", "layout");

      for (const event of events) {
        const { timestamp } = await client.getBlock({
          blockNumber: event.blockNumber,
        });
        const date = new Date(Number(timestamp) * 1000);
        const dateString = date.toISOString();

        switch (event.eventName) {
          case "EnvelopeRegistered":
            await supabaseAdmin.from("Envelopes").upsert([
              {
                id: event.args.envelopeId!,
                origin_chain_id: Number(event.args.envelope?.originChainId),
                destination_chain_id: Number(
                  event.args.envelope?.destinationChainId,
                ),
                message: event.args.envelope?.message,
                nonce: Number(event.args.envelope?.nonce),
                origin: event.args.envelope?.origin,
                destination: event.args.envelope?.destination,
                registered_at: dateString,
              },
            ]);

            await supabaseAdmin.from("EnvelopeRegistered").upsert([
              {
                envelope_id: event.args.envelopeId!,
                transaction_hash: event.transactionHash,
                log_index: Number(event.logIndex),
                block_number: Number(event.blockNumber),
                chain_id: client.chain?.id,
                timestamp: dateString,
              },
            ]);

            try {
              if (client.chain?.id) {
                await calculateTxCosts(event.transactionHash, client.chain.id);
              }
            } catch(error) {
              console.log("Failed to calculate tx costs: ", error);
            }

            break;

          case "EnvelopeDeliveryAttempted":
            await supabaseAdmin.from("Envelopes").upsert([
              {
                id: event.args.envelopeId!,
                origin_chain_id: Number(event.args.envelope?.originChainId),
                destination_chain_id: Number(
                  event.args.envelope?.destinationChainId,
                ),
                message: event.args.envelope?.message,
                nonce: Number(event.args.envelope?.nonce),
                origin: event.args.envelope?.origin,
                destination: event.args.envelope?.destination,
              },
            ]);

            await supabaseAdmin.from("EnvelopeDeliveryAttempted").upsert([
              {
                envelope_id: event.args.envelopeId!,
                transaction_hash: event.transactionHash,
                log_index: Number(event.logIndex),
                block_number: Number(event.blockNumber),
                chain_id: client.chain?.id,
                is_delivered: event.args.isDelivered,
                timestamp: dateString,
              },
            ]);
            break;

          case "TransactionForwardingAttempted":
            await supabaseAdmin.from("Envelopes").upsert([
              {
                id: event.args.envelopeId!,
              },
            ]);

            await supabaseAdmin.from("TransactionForwardingAttempted").upsert([
              {
                envelope_id: event.args.envelopeId!,
                transaction_hash: event.transactionHash,
                log_index: Number(event.logIndex),
                block_number: Number(event.blockNumber),
                chain_id: client.chain?.id,
                transaction_id: event.args.transactionId,
                destination_chain_id: Number(event.args.destinationChainId),
                bridge_adapter: event.args.bridgeAdapter,
                destination_bridge_adapter: event.args.destinationBridgeAdapter,
                adapter_successful: event.args.adapterSuccessful,
                return_data: event.args.returnData,
                encoded_transaction: event.args.encodedTransaction,
                timestamp: dateString,
              },
            ]);
            break;

          case "TransactionReceived":
            await supabaseAdmin.from("Envelopes").upsert([
              {
                id: event.args.envelopeId!,
              },
            ]);
            await supabaseAdmin.from("TransactionReceived").upsert([
              {
                envelope_id: event.args.envelopeId!,
                transaction_hash: event.transactionHash,
                log_index: Number(event.logIndex),
                block_number: Number(event.blockNumber),
                chain_id: client.chain?.id,
                transaction_id: event.args.transactionId,
                origin_chain_id: Number(event.args.originChainId),
                bridge_adapter: event.args.bridgeAdapter,
                confirmations: Number(event.args.confirmations),
                nonce: Number(event.args.transaction?.nonce),
                encoded_envelope: event.args.transaction?.encodedEnvelope,
                timestamp: dateString,
              },
            ]);
            break;

          default:
            console.log("Unknown event found");
            break;
        }

        // upsert event
      }
    }

    if (!isRetry) {
      await supabaseAdmin
        .from("CrossChainControllers")
        .update({
          last_scanned_block: to,
        })
        .eq("chain_id", Number(client.chain?.id));
    }
    if (isRetry) {
      await supabaseAdmin
        .from("Retries")
        .delete()
        .eq("chain_id", Number(client.chain?.id))
        .eq("from_block", from)
        .eq("to_block", to);
    }
  } catch (error) {
    console.log(
      `Will need to retry chain ${client.chain?.id} from ${from} to ${to}. Current iteration failed.`,
    );
    await supabaseAdmin.from("Retries").upsert({
      chain_id: Number(client.chain?.id),
      from_block: from,
      to_block: to,
    });
  }
};
