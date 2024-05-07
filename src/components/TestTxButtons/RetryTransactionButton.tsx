"use client";

import React, { useState } from "react";

import { useLastTxLocalStatus } from "@/hooks/useLastTxLocalStatus";
import { useStore } from "@/providers/ZustandStoreProvider";
import { TxType } from "@/store/transactionsSlice";
import { type RetryTransactionTxParams } from '@/web3Services/controllerRetryService';
import { Button } from '@/components/Button';
import { api } from '@/trpc/react';
import { type Address, zeroAddress } from 'viem';
import { ModalForTestTx } from '@/components/TransactionsModals/ModalForTestTx';
import { textCenterEllipsis } from '@/utils/textCenterEllipsis';

export const RetryTransactionButton = (initialParams: Omit<RetryTransactionTxParams, 'cccAddress' | 'gasLimit'>) => {
  const retryTransaction = useStore((state) => state.retryTransaction);

  const { data: initialCCCAddress } = api.address.getCrossChainControllerAddressByChainId.useQuery({ chainId: initialParams.chainId });
  const cccAddress = initialCCCAddress as Address ?? zeroAddress;

  const formattedParams = {
    ...initialParams,
    gasLimit: BigInt(0), // TODO: need calculate
    cccAddress,
  }

  const [isRetryTransactionModalOpen, setIsRetryTransactionModal] = useState(false);

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
        Retry transaction: {textCenterEllipsis(initialParams.encodedTransaction, 5, 5)}
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
