import {
  selectTxExplorerLink,
  type TxLocalStatusTxParams,
} from "@bgd-labs/frontend-web3-utils";
import React, { type ReactNode } from "react";

import { CopyToClipboard } from "@/components/CopyToClipboard";
import { Link } from "@/components/Link";
import { chainInfoHelpers, useStore } from "@/providers/ZustandStoreProvider";
import { type TransactionUnion } from "@/store/transactionsSlice";
import { cn } from "@/utils/cn";

export interface TxModalContentProps {
  isTxStart: boolean;
  setIsTxStart: (value: boolean) => void;
  setIsOpen: (value: boolean) => void;
  setError: (value: string) => void;
  topInfo?: ReactNode;
  successElement?: ReactNode;
  fullTxErrorMessage?: string;
  tx?: TxLocalStatusTxParams<TransactionUnion>;
  withTryAgain?: boolean;
  closeButtonText?: string;
  children: ReactNode;
}

export const TxModalContent = ({
  isTxStart,
  setIsTxStart,
  topInfo,
  successElement,
  fullTxErrorMessage,
  tx,
  withTryAgain,
  setIsOpen,
  setError,
  closeButtonText,
  children,
}: TxModalContentProps) => {
  const transactionsPool = useStore((store) => store.transactionsPool);

  const isFinalStatus =
    !tx?.pending && (tx?.isError ?? tx?.isSuccess ?? tx?.isReplaced);

  return (
    <>
      {topInfo}

      <div className={cn("flex w-full flex-col justify-between")}>
        {isTxStart ? (
          <>
            <div
              className={cn(
                "relative top-0 my-4 flex flex-1 flex-col items-center justify-center",
              )}
            >
              <div className="flex min-h-[80px] items-center justify-center">
                {tx?.pending && <div>Tx pending image</div>}
                {tx?.isError && <div>Tx error image</div>}
                {tx?.isSuccess && <div>Tx executed image</div>}
              </div>
              <h3 className="mb-1 text-lg font-bold text-brand-900 dark:text-brand-100">
                {tx?.pending && "Pending..."}
                {tx?.isSuccess && "Success"}
                {tx?.isError && "Error"}
                {tx?.isReplaced && "Replaced"}
              </h3>
              <div>
                {tx?.pending &&
                  "Waiting while the transaction is getting executed"}
                {tx?.isSuccess && !!successElement
                  ? successElement
                  : tx?.isSuccess && "Transaction executed"}
                {tx?.isError && "The transaction failed"}
                {tx?.isReplaced && "The transaction replaced"}
              </div>
            </div>

            <div
              className={cn("mb-0 mt-3 min-h-1.5", {
                ["mb-3 mt-0"]: isFinalStatus,
              })}
            >
              {tx?.isError && (
                <div className="flex flex-col items-center justify-center">
                  {fullTxErrorMessage && (
                    <CopyToClipboard copyText={String(fullTxErrorMessage)}>
                      <p>{fullTxErrorMessage}</p>
                    </CopyToClipboard>
                  )}
                </div>
              )}

              <div className="my-5">
                {tx?.hash && tx?.walletType && (
                  <div className="flex items-center justify-center">
                    <Link
                      href={selectTxExplorerLink(
                        transactionsPool,
                        chainInfoHelpers.getChainParameters,
                        tx.hash,
                      )}
                      className="items-center text-gray-500"
                      inNewWindow
                    >
                      <span className="size-[14px] text-gray-500">
                        {tx.replacedTxHash
                          ? "Transaction hash"
                          : "View on explorer"}
                      </span>
                    </Link>
                  </div>
                )}
                {tx?.isReplaced && tx?.replacedTxHash && tx?.hash && (
                  <div className="mt-2 flex items-center justify-center">
                    {tx.chainId && (
                      <Link
                        href={selectTxExplorerLink(
                          transactionsPool,
                          chainInfoHelpers.getChainParameters,
                          tx.hash,
                          tx.replacedTxHash,
                        )}
                        className="items-center text-gray-500"
                        inNewWindow
                      >
                        <span className="size-[14px] text-gray-500">
                          Replaced transaction hash
                        </span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex min-h-2 items-center justify-center">
              {(tx?.isSuccess ?? tx?.isReplaced) && (
                <button type="button" onClick={() => setIsOpen(false)}>
                  {closeButtonText ?? "Close"}
                </button>
              )}
              {tx?.isError && (
                <>
                  <button type="button" onClick={() => setIsOpen(false)}>
                    {closeButtonText ?? "Close"}
                  </button>

                  {withTryAgain && (
                    <button
                      type="button"
                      className="ml-3"
                      onClick={() => {
                        setIsTxStart(false);
                        setError("");
                      }}
                    >
                      Try again
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <>{children}</>
        )}
      </div>
    </>
  );
};
