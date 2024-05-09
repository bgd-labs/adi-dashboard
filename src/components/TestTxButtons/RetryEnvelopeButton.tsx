"use client";

import React, { useState } from "react";
import { type Address, zeroAddress } from "viem";

import { Button } from "@/components/Button";
import { ModalForTestTx } from "@/components/TransactionsModals/ModalForTestTx";
import { useLastTxLocalStatus } from "@/hooks/useLastTxLocalStatus";
import { useStore } from "@/providers/ZustandStoreProvider";
import { TxType } from "@/store/transactionsSlice";
import { api } from "@/trpc/react";
import { type RetryEnvelopeTxParams } from "@/web3Services/crossChainControllerTXsService";

export const RetryEnvelopeButton = (
  initialParams: Omit<RetryEnvelopeTxParams, "cccAddress">,
) => {
  const retryEnvelope = useStore((state) => state.retryEnvelope);

  const { data: initialCCCAddress } =
    api.address.getCrossChainControllerAddressByChainId.useQuery({
      chainId: initialParams.chainId,
    });

  const cccAddress = (initialCCCAddress as Address) ?? zeroAddress;

  const formattedParams = {
    ...initialParams,
    cccAddress,
  };

  const [isRetryEnvelopeModalOpen, setIsRetryEnvelopeModal] = useState(false);

  const {
    executeTxWithLocalStatuses: retryEnvelopeExecute,
    fullTxErrorMessage: retryEnvelopeErrorMessage,
    setFullTxErrorMessage: retryEnvelopeSetErrorMessage,
    setIsTxStart: retryEnvelopeSetIsTxStart,
    isTxStart: retryEnvelopeIsTxStart,
    setError: retryEnvelopeSetError,
    tx: retryEnvelopeTx,
  } = useLastTxLocalStatus({
    type: TxType.retryEnvelope,
    payload: formattedParams,
  });

  const handleRetryEnvelope = async () => {
    setIsRetryEnvelopeModal(true);
    await retryEnvelopeExecute({
      callbackFunction: async () => await retryEnvelope(formattedParams),
    });
  };

  return (
    <>
      <Button type="danger" onClick={handleRetryEnvelope}>
        Retry envelope
      </Button>

      <ModalForTestTx
        title="Retry envelope"
        successTitle="Tx succeed"
        tx={retryEnvelopeTx}
        isOpen={isRetryEnvelopeModalOpen}
        setIsOpen={setIsRetryEnvelopeModal}
        isTxStart={retryEnvelopeIsTxStart}
        setIsTxStart={retryEnvelopeSetIsTxStart}
        setError={retryEnvelopeSetError}
        fullTxErrorMessage={retryEnvelopeErrorMessage}
        setFullTxErrorMessage={retryEnvelopeSetErrorMessage}
      />
    </>
  );
};
