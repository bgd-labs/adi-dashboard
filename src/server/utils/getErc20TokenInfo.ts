import { env } from "@/env";

interface TokenInfo {
  name: string;
  symbol: string;
}

const KNOWN_TOKENS: Record<number, Record<string, TokenInfo>> = {
  1: {
    "0x514910771af9ca656af840dff83e8264ecf986ca": {
      name: "chainlink",
      symbol: "link",
    },
  },
  137: {
    "0xb0897686c545045afc77cf20ec7a532e3120e0f1": {
      name: "chainlink",
      symbol: "link",
    },
  },
  43114: {
    "0x5947bb275c521040051d82396192181b413227a3": {
      name: "chainlink",
      symbol: "link",
    },
  },
};

export const getErc20TokenInfo = async (
  tokenAddress: string,
  formattedBlockDate: string,
  chainId: number,
) => {
  const lowerCaseTokenAddress = tokenAddress.toLowerCase();
  const knownToken = KNOWN_TOKENS[chainId]?.[lowerCaseTokenAddress];

  let tokenInfo;

  if (knownToken) {
    tokenInfo = knownToken;
  } else {
    const tokenData = await fetch(
      `https://api.coingecko.com/api/v3/coins/ethereum/contract/${tokenAddress}?x_cg_demo_api_key=${env.COINGECKO_API_KEY}`,
    );
    if (!tokenData.ok) {
      throw new Error(`Failed to fetch token data for address ${tokenAddress}`);
    }
    const tokenDataJson = await tokenData.json();

    tokenInfo = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      name: tokenDataJson.id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      symbol: tokenDataJson.symbol,
    };
  }

  const tokenMarketDataOnDateData = await fetch(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    `https://api.coingecko.com/api/v3/coins/${tokenInfo.name}/history?date=${formattedBlockDate}&localization=false&x_cg_demo_api_key=${env.COINGECKO_API_KEY}`,
  );
  if (!tokenMarketDataOnDateData.ok) {
    throw new Error(
      `Failed to fetch token price data for token ${tokenInfo.name} on date ${formattedBlockDate}`,
    );
  }
  const tokenMarketDataOnDate = await tokenMarketDataOnDateData.json();
  const tokenPriceOnDate =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    tokenMarketDataOnDate.market_data.current_price.usd;

  return {
    name: tokenInfo.name,
    symbol: tokenInfo.symbol,
    price: parseFloat(Number(tokenPriceOnDate).toFixed(10)),
  };
};
