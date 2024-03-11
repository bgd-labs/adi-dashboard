export type CrossChainController = {
  chain_id: number;
  address: string;
  created_block: number;
  last_scanned_block: number | null;
  rpc_urls: string[] | null;
  rpc_block_limit: number;
};

export type FailedBlock = {
  from_block: number;
  to_block: number;
  chain_id: number;
};

export type RangeStatus = {
  range: [number, number];
  status: "scanned" | "failed" | "pending";
};

export type Action = {
  from: string;
  callType: string;
  gas: string;
  input: string;
  to: string;
  value: string;
};

export type Result = {
  gasUsed: string;
  output: string;
};

export type Trace = {
  action: Action;
  blockHash: string;
  blockNumber: number;
  result: Result;
  subtraces: number;
  traceAddress: number[];
  transactionHash: string;
  transactionPosition: number;
  type: string;
};
