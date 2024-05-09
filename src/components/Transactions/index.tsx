import React, { type ReactNode, useEffect } from "react";

import { Dialog, DialogContent } from "@/components/Modal";

export interface TxModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  children: ReactNode;
  setIsTxStart: (value: boolean) => void;
  setError: (value: string) => void;
  setFullTxErrorMessage: (value: string) => void;
}

export const TxModal = ({
  isOpen,
  setIsOpen,
  children,
  setIsTxStart,
  setError,
  setFullTxErrorMessage,
}: TxModalProps) => {
  useEffect(() => {
    setIsTxStart(false);
    setError("");
    setFullTxErrorMessage("");
  }, [isOpen, setError, setFullTxErrorMessage, setIsTxStart]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
};
