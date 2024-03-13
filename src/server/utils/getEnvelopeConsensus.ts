type TransactionReceived = {
  chain_id: number | null;
  transaction_id: string | null;
};

type EnvelopeDeliveryAttempted = {
  chain_id: number | null;
  is_delivered: boolean | null;
};

type TransactionForwardingAttempted = {
  chain_id: number | null;
  adapter_successful: boolean | null;
  timestamp: string | null;
};

export type EnvelopeData = {
  created_at: string | null;
  destination: string | null;
  destination_chain_id: number | null;
  id: string | null;
  message: string | null;
  nonce: number | null;
  origin: string | null;
  origin_chain_id: number | null;
  registered_at: string | null;
  TransactionReceived: TransactionReceived[];
  EnvelopeDeliveryAttempted: EnvelopeDeliveryAttempted[];
  TransactionForwardingAttempted: TransactionForwardingAttempted[];
};

export const getEnvelopeConsensus = (envelopeData: EnvelopeData) => {
  const forwardingAttemptsGroupedByTimestamp =
    envelopeData.TransactionForwardingAttempted.reduce(
      (acc: Record<string, number>, curr) => {
        const timestamp = curr.timestamp;
        if (!timestamp) return acc;

        if (!acc[timestamp]) {
          acc[timestamp] = 0;
        }
        acc[timestamp]++;
        return acc;
      },
      {},
    );

  const firstKey = Object.keys(forwardingAttemptsGroupedByTimestamp)[0];
  const confirmationsTotal =
    firstKey !== undefined ? forwardingAttemptsGroupedByTimestamp[firstKey] : 0;

  const transactionReceivedGroupedByTxId =
    envelopeData.TransactionReceived.reduce(
      (acc: Record<string, number>, curr) => {
        const transactionId = curr.transaction_id;
        if (!transactionId) return acc;

        if (!acc[transactionId]) {
          acc[transactionId] = 0;
        }
        acc[transactionId]++;
        return acc;
      },
      {},
    );

  const maxConfirmationCount =
    Object.values(transactionReceivedGroupedByTxId).length > 0
      ? Math.max(...Object.values(transactionReceivedGroupedByTxId))
      : 0;

  const envelopeConfirmations = maxConfirmationCount;

  const envelopeConsensus = {
    skip: envelopeData.destination_chain_id === envelopeData.origin_chain_id,
    is_reached: envelopeData.EnvelopeDeliveryAttempted.length > 0,
    confirmations_total: confirmationsTotal,
  };

  return {
    confirmations: envelopeConfirmations,
    consensus: envelopeConsensus,
  };
};
