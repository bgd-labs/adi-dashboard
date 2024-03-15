const PROPOSALS_PAYLOADS_URL =
  "https://raw.githubusercontent.com/bgd-labs/aave-governance-ui-helpers/main/cache/ui/mainnet/proposals_payloads.json";

type PayloadItem = {
  id: number;
  chainId: number;
  payloadsController: string;
};

type PayloadData = Record<string, PayloadItem[]>;

type Data = {
  data: PayloadData;
};

export const getPayloadProposalRelation = async (
  payloadId: number | string,
) => {
  const response = await fetch(PROPOSALS_PAYLOADS_URL, {
    next: { revalidate: 30 },
  });
  const { data } = (await response.json()) as Data;

  for (const key in data) {
    if (data[key]!.some((item) => item.id === Number(payloadId))) {
      return key;
    }
  }

  return null;
};
