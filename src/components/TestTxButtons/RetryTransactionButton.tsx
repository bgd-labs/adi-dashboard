"use client";

import React, { useState } from "react";
import { type Address, zeroAddress } from "viem";

import { Button } from "@/components/Button";
import { ModalForTestTx } from "@/components/TransactionsModals/ModalForTestTx";
import { useLastTxLocalStatus } from "@/hooks/useLastTxLocalStatus";
import { useStore } from "@/providers/ZustandStoreProvider";
import { TxType } from "@/store/transactionsSlice";
import { api } from "@/trpc/react";
import { textCenterEllipsis } from "@/utils/textCenterEllipsis";
import { type RetryTransactionTxParams } from "@/web3Services/crossChainControllerTXsService";

export const RetryTransactionButton = (
  initialParams: Omit<RetryTransactionTxParams, "cccAddress">,
) => {
  const retryTransaction = useStore((state) => state.retryTransaction);

  const { data: initialCCCAddress } =
    api.address.getCrossChainControllerAddressByChainId.useQuery({
      chainId: initialParams.chainId,
    });
  const cccAddress = (initialCCCAddress as Address) ?? zeroAddress;

  const formattedParams = {
    ...initialParams,
    cccAddress,
  };

  const [isRetryTransactionModalOpen, setIsRetryTransactionModal] =
    useState(false);

  const {
    executeTxWithLocalStatuses: retryTransactionExecute,
    fullTxErrorMessage: retryTransactionErrorMessage,
    setFullTxErrorMessage: retryTransactionSetErrorMessage,
    setIsTxStart: retryTransactionSetIsTxStart,
    isTxStart: retryTransactionIsTxStart,
    setError: retryTransactionSetError,
    tx: retryTransactionTx,
  } = useLastTxLocalStatus({
    type: TxType.retryTransaction,
    payload: formattedParams,
  });

  const handleRetryTransaction = async () => {
    setIsRetryTransactionModal(true);
    await retryTransactionExecute({
      callbackFunction: async () => await retryTransaction(formattedParams),
    });
  };

  return (
    <>
      <Button type="primary" onClick={handleRetryTransaction}>
        Retry transaction:{" "}
        {textCenterEllipsis(initialParams.encodedTransaction, 5, 5)}
      </Button>

      <ModalForTestTx
        title={`Retry transaction: ${textCenterEllipsis(initialParams.encodedTransaction, 5, 5)}`}
        successTitle="Tx succeed"
        tx={retryTransactionTx}
        isOpen={isRetryTransactionModalOpen}
        setIsOpen={setIsRetryTransactionModal}
        isTxStart={retryTransactionIsTxStart}
        setIsTxStart={retryTransactionSetIsTxStart}
        setError={retryTransactionSetError}
        fullTxErrorMessage={retryTransactionErrorMessage}
        setFullTxErrorMessage={retryTransactionSetErrorMessage}
      />
    </>
  );
};
