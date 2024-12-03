import { api } from "@/trpc/server";

type ExplorerLinkProps = {
  chainId: number;
  address: string;
  txHash: string;
};

export const BridgeExplorerLink = async ({
  chainId,
  address,
  txHash,
}: ExplorerLinkProps) => {
  const bridgeExplorerLink = await api.address.getBridgeExplorerLink({
    address,
    chainId,
  });

  if (!bridgeExplorerLink) {
    return null;
  }

  const link = `${bridgeExplorerLink}${txHash}`;

  return (
    <a
      href={link}
      target="_blank"
      className="mb-4 inline-flex gap-2 border bg-white p-1 pr-2 text-sm text-brand-900 hover:border-brand-900"
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M5 5H14.0909V8.59551H8.63636V13.9888H5V5Z" fill="black" />
        <path d="M45 5H35.9091V8.59551H41.3636V13.9888H45V5Z" fill="black" />
        <path d="M5 45V36.0112H8.63636V41.4045H14.0909V45H5Z" fill="black" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M34.9943 32.8595C36.7034 30.7743 37.7273 28.1178 37.7273 25.2247C37.7273 18.5228 32.2326 13.0899 25.4545 13.0899C18.6765 13.0899 13.1818 18.5228 13.1818 25.2247C13.1818 31.9266 18.6765 37.3596 25.4545 37.3596C27.9885 37.3596 30.3431 36.6002 32.2983 35.2992L40.2655 42.3418L42.6891 39.6613L34.9943 32.8595ZM25.4545 33.764C30.2243 33.764 34.0909 29.9409 34.0909 25.2247C34.0909 20.5086 30.2243 16.6854 25.4545 16.6854C20.6848 16.6854 16.8182 20.5086 16.8182 25.2247C16.8182 29.9409 20.6848 33.764 25.4545 33.764Z"
          fill="black"
        />
      </svg>
      View on bridge explorer
    </a>
  );
};
