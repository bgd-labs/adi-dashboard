import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type Hash, type PublicClient } from "viem";

import { db } from "@/server/db";
import {
  crossChainControllers,
  envelopeDeliveryAttempted,
  envelopeRegistered,
  envelopes,
  retries,
  transactionForwardingAttempted,
  transactionReceived,
} from "@/server/db/schema";
import { calculateTxCosts } from "@/server/eventCollection/calculateTxCosts";

import { cccEventsAbi } from "../constants/cccEventsAbi";

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
      for (const event of events) {
        const { timestamp } = await client.getBlock({
          blockNumber: event.blockNumber,
        });
        const date = new Date(Number(timestamp) * 1000);
        const dateString = date.toISOString();

        switch (event.eventName) {
          case "EnvelopeRegistered":
            console.log(
              `Envelope registered: ${event.args.envelopeId} on block ${event.blockNumber} on chain ${client.chain?.id}`,
            );
            await db
              .insert(envelopes)
              .values({
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
              })
              .onConflictDoUpdate({
                target: envelopes.id,
                set: {
                  origin_chain_id: sql`excluded.origin_chain_id`,
                  destination_chain_id: sql`excluded.destination_chain_id`,
                  message: sql`excluded.message`,
                  nonce: sql`excluded.nonce`,
                  origin: sql`excluded.origin`,
                  destination: sql`excluded.destination`,
                  registered_at: sql`excluded.registered_at`,
                },
              });

            await db
              .insert(envelopeRegistered)
              .values({
                envelope_id: event.args.envelopeId!,
                transaction_hash: event.transactionHash,
                log_index: Number(event.logIndex),
                block_number: Number(event.blockNumber),
                chain_id: client.chain?.id,
                timestamp: dateString,
              })
              .onConflictDoUpdate({
                target: [
                  envelopeRegistered.transaction_hash,
                  envelopeRegistered.log_index,
                ],
                set: {
                  envelope_id: sql`excluded.envelope_id`,
                  block_number: sql`excluded.block_number`,
                  chain_id: sql`excluded.chain_id`,
                  timestamp: sql`excluded.timestamp`,
                },
              });

            try {
              if (client.chain?.id) {
                await calculateTxCosts(event.transactionHash, client.chain.id);
              }
            } catch (error) {
              console.log("Failed to calculate tx costs: ", error);
            }
            revalidatePath(`/envelope/${event.args.envelopeId}`);
            break;

          case "EnvelopeDeliveryAttempted":
            console.log(
              `Envelope delivery attempted: ${event.args.envelopeId} on block ${event.blockNumber} on chain ${client.chain?.id}`,
            );
            await db
              .insert(envelopes)
              .values({
                id: event.args.envelopeId!,
                origin_chain_id: Number(event.args.envelope?.originChainId),
                destination_chain_id: Number(
                  event.args.envelope?.destinationChainId,
                ),
                message: event.args.envelope?.message,
                nonce: Number(event.args.envelope?.nonce),
                origin: event.args.envelope?.origin,
                destination: event.args.envelope?.destination,
              })
              .onConflictDoUpdate({
                target: envelopes.id,
                set: {
                  origin_chain_id: sql`excluded.origin_chain_id`,
                  destination_chain_id: sql`excluded.destination_chain_id`,
                  message: sql`excluded.message`,
                  nonce: sql`excluded.nonce`,
                  origin: sql`excluded.origin`,
                  destination: sql`excluded.destination`,
                },
              });

            await db
              .insert(envelopeDeliveryAttempted)
              .values({
                envelope_id: event.args.envelopeId!,
                transaction_hash: event.transactionHash,
                log_index: Number(event.logIndex),
                block_number: Number(event.blockNumber),
                chain_id: client.chain?.id,
                is_delivered: event.args.isDelivered,
                timestamp: dateString,
              })
              .onConflictDoUpdate({
                target: [
                  envelopeDeliveryAttempted.transaction_hash,
                  envelopeDeliveryAttempted.log_index,
                ],
                set: {
                  envelope_id: sql`excluded.envelope_id`,
                  block_number: sql`excluded.block_number`,
                  chain_id: sql`excluded.chain_id`,
                  is_delivered: sql`excluded.is_delivered`,
                  timestamp: sql`excluded.timestamp`,
                },
              });
            revalidatePath(`/envelope/${event.args.envelopeId}`);
            break;

          case "TransactionForwardingAttempted":
            console.log(
              `Transaction forwarding attempted: ${event.args.envelopeId} on block ${event.blockNumber} on chain ${client.chain?.id}`,
            );
            await db
              .insert(envelopes)
              .values({
                id: event.args.envelopeId!,
              })
              .onConflictDoNothing();

            await db
              .insert(transactionForwardingAttempted)
              .values({
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
              })
              .onConflictDoUpdate({
                target: [
                  transactionForwardingAttempted.transaction_hash,
                  transactionForwardingAttempted.log_index,
                ],
                set: {
                  envelope_id: sql`excluded.envelope_id`,
                  block_number: sql`excluded.block_number`,
                  chain_id: sql`excluded.chain_id`,
                  transaction_id: sql`excluded.transaction_id`,
                  destination_chain_id: sql`excluded.destination_chain_id`,
                  bridge_adapter: sql`excluded.bridge_adapter`,
                  destination_bridge_adapter: sql`excluded.destination_bridge_adapter`,
                  adapter_successful: sql`excluded.adapter_successful`,
                  return_data: sql`excluded.return_data`,
                  encoded_transaction: sql`excluded.encoded_transaction`,
                  timestamp: sql`excluded.timestamp`,
                },
              });
            revalidatePath(`/envelope/${event.args.envelopeId}`);
            break;

          case "TransactionReceived":
            console.log(
              `Transaction received: ${event.args.envelopeId} on block ${event.blockNumber} on chain ${client.chain?.id}`,
            );
            await db
              .insert(envelopes)
              .values({
                id: event.args.envelopeId!,
              })
              .onConflictDoNothing();

            await db
              .insert(transactionReceived)
              .values({
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
              })
              .onConflictDoUpdate({
                target: [
                  transactionReceived.transaction_hash,
                  transactionReceived.log_index,
                ],
                set: {
                  envelope_id: sql`excluded.envelope_id`,
                  block_number: sql`excluded.block_number`,
                  chain_id: sql`excluded.chain_id`,
                  transaction_id: sql`excluded.transaction_id`,
                  origin_chain_id: sql`excluded.origin_chain_id`,
                  bridge_adapter: sql`excluded.bridge_adapter`,
                  confirmations: sql`excluded.confirmations`,
                  nonce: sql`excluded.nonce`,
                  encoded_envelope: sql`excluded.encoded_envelope`,
                  timestamp: sql`excluded.timestamp`,
                },
              });
            revalidatePath(`/envelope/${event.args.envelopeId}`);
            break;

          default:
            console.log("Unknown event found");
            break;
        }
      }
    }

    if (!isRetry) {
      await db
        .update(crossChainControllers)
        .set({ last_scanned_block: to })
        .where(eq(crossChainControllers.chain_id, Number(client.chain?.id)));
    }
    if (isRetry) {
      await db
        .delete(retries)
        .where(
          and(
            eq(retries.chain_id, Number(client.chain?.id)),
            eq(retries.from_block, from),
            eq(retries.to_block, to),
          ),
        );
    }
  } catch (error) {
    console.log(
      `Will need to retry chain ${client.chain?.id} from ${from} to ${to}. Current iteration failed.`,
    );
    await db
      .insert(retries)
      .values({
        chain_id: Number(client.chain?.id),
        from_block: from,
        to_block: to,
      })
      .onConflictDoUpdate({
        target: [retries.from_block, retries.to_block, retries.chain_id],
        set: {
          chain_id: sql`excluded.chain_id`,
        },
      });
  }
};
