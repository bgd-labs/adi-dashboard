import React from "react";

import { TxModal, type TxModalProps } from "@/components/Transactions";
import {
  TxModalContent,
  type TxModalContentProps,
} from "@/components/Transactions/TxModalContent";

export const ModalForTestTx = ({
  isOpen,
  setIsOpen,
  setIsTxStart,
  setError,
  fullTxErrorMessage,
  tx,
  isTxStart,
  setFullTxErrorMessage,
  title,
  successTitle,
}: Pick<
  TxModalContentProps,
  | "setIsOpen"
  | "isTxStart"
  | "setIsTxStart"
  | "setError"
  | "fullTxErrorMessage"
  | "tx"
> &
  Pick<TxModalProps, "isOpen" | "setFullTxErrorMessage"> & {
    title: string;
    successTitle: string;
  }) => {
  return (
    <TxModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      setIsTxStart={setIsTxStart}
      setError={setError}
      setFullTxErrorMessage={setFullTxErrorMessage}
    >
      <TxModalContent
        isTxStart={isTxStart}
        setIsTxStart={setIsTxStart}
        setIsOpen={setIsOpen}
        setError={setError}
        successElement={<h1>{successTitle}</h1>}
        fullTxErrorMessage={fullTxErrorMessage}
        tx={tx}
        topInfo={<h1>{title}</h1>}
      >
        <p>{title}</p>
      </TxModalContent>
    </TxModal>
  );
};
