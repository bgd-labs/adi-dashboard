import {
  selectAllTransactionsByWallet,
  selectPendingTransactionByWallet,
  TransactionStatus,
} from "@bgd-labs/frontend-web3-utils";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { zeroAddress } from "viem";
import { mainnet } from "viem/chains";

import { Button } from "@/components/Button";
import { Link } from "@/components/Link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/Modal";
import { Spinner } from "@/components/Spinner";
import { useStore } from "@/providers/ZustandStoreProvider";
import { api } from "@/trpc/react";
import { cn } from "@/utils/cn";
import { checkAvatar } from "@/utils/ensHelpers";
import { getChainName } from "@/utils/getChainName";
import { getScanLink } from "@/utils/getScanLink";
import { textCenterEllipsis } from "@/utils/textCenterEllipsis";

export const WalletActive = () => {
  const activeWallet = useStore((store) => store.activeWallet);
  const disconnectActiveWallet = useStore(
    (store) => store.disconnectActiveWallet,
  );
  const walletConnectedTimeLock = useStore(
    (store) => store.walletConnectedTimeLock,
  );

  const activeAddress = activeWallet?.address ?? "";

  const { data } = api.ens.get.useQuery({
    walletAddress: activeWallet?.address ?? zeroAddress,
  });

  const allTxsFromStore = useStore((store) =>
    selectAllTransactionsByWallet(
      store.transactionsPool,
      activeAddress || zeroAddress,
    ),
  );
  const pendingTxsFromStore = useStore((store) =>
    selectPendingTransactionByWallet(
      store.transactionsPool,
      activeAddress || zeroAddress,
    ),
  );

  const allTransactions = !!activeAddress ? allTxsFromStore : [];
  const lastTransaction = allTransactions[allTransactions.length - 1];

  const [lastTransactionSuccess, setLastTransactionSuccess] = useState(false);
  const [lastTransactionError, setLastTransactionError] = useState(false);

  useEffect(() => {
    if (lastTransaction?.status && activeWallet && !walletConnectedTimeLock) {
      if (lastTransaction.status === TransactionStatus.Success) {
        setLastTransactionSuccess(true);
        setTimeout(() => setLastTransactionSuccess(false), 1000);
      } else if (lastTransaction.status === TransactionStatus.Reverted) {
        setLastTransactionError(true);
        setTimeout(() => setLastTransactionError(false), 1000);
      }
    }
  }, [lastTransaction]);

  // get all pending tx's from connected Wallet
  const allPendingTransactions = activeAddress ? pendingTxsFromStore : [];
  // filtered pending tx's, if now > tx.timestamp + 30 min, than remove tx from pending array to not show loading spinner in connect Wallet button
  const filteredPendingTx = allPendingTransactions.filter(
    (tx) => dayjs().unix() <= dayjs.unix(tx.localTimestamp).unix() + 1800,
  );

  const handleDisconnect = async () => {
    await disconnectActiveWallet();
  };

  const shownUserName = !!data?.name ? data.name : activeAddress;
  const avatar = !!data?.avatar
    ? data.avatar
    : checkAvatar({ walletAddress: activeAddress });
  const ensNameAbbreviated = shownUserName
    ? shownUserName.length > 11
      ? textCenterEllipsis(shownUserName, 5, 3)
      : shownUserName
    : undefined;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="ml-1 inline-block text-sm opacity-70">
              {getChainName(activeWallet?.chainId ?? mainnet.id)}
            </div>
          </div>

          <button
            type="button"
            className={cn(
              "grid grid-flow-col items-center gap-2 border border-white/30 pl-2 hover:border-white/60",
              {
                ["bg-red-400"]: lastTransactionError,
                ["bg-green-400"]: lastTransactionSuccess,
              },
            )}
          >
            <div className="font-mono text-xs">
              {lastTransactionError
                ? "Error"
                : lastTransactionSuccess
                  ? "Success"
                  : ensNameAbbreviated
                    ? ensNameAbbreviated
                    : textCenterEllipsis(activeAddress, 4, 4)}
            </div>
            <div className="relative flex h-[26px] w-[26px] items-center justify-center">
              {!!filteredPendingTx.length && (
                <div className="absolute inset-0 flex items-center justify-center bg-brand-900/70">
                  <Spinner className="h-5 w-5 fill-white text-white/30" />
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatar} alt="" />
            </div>
          </button>
        </div>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-4 text-center">Wallet info</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="mb-6 flex items-center gap-3 bg-brand-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="h-10 w-10" src={avatar} alt="" />
            <div className="truncate font-mono">
              <Link
                inNewWindow
                className="break-all font-semibold tracking-wide"
                href={getScanLink({
                  chainId: activeWallet?.chainId,
                  address: activeAddress || zeroAddress,
                })}
              >
                {shownUserName}
              </Link>
            </div>
          </div>
          <div className="mt-3 flex w-full justify-end">
            <DialogClose
              className="transition-all hover:opacity-65"
              type="button"
              onClick={handleDisconnect}
            >
              <Button>Disconnect</Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
