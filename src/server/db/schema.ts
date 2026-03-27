import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  customType,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// Custom type: numeric columns returned as JS numbers (matching Supabase PostgREST behavior)
const numericNumber = customType<{ data: number; driverData: string }>({
  dataType() {
    return "numeric";
  },
  fromDriver(value: string) {
    return Number(value);
  },
});

const HEX_LITERAL_REGEX = /^(?:0x|\\x)[0-9a-f]+$/i;

// Custom type: bytea columns returned as 0x-prefixed hex strings
const byteaHex = customType<{ data: string; driverData: Uint8Array }>({
  dataType() {
    return "bytea";
  },
  fromDriver(value: Uint8Array) {
    const asciiValue = Buffer.from(value).toString("utf8");
    if (HEX_LITERAL_REGEX.test(asciiValue)) {
      return asciiValue.replace(/^\\x/i, "0x");
    }

    return "0x" + Buffer.from(value).toString("hex");
  },
  toDriver(value: string) {
    const hex = value.replace(/^(\\x|0x)/, "");
    return Buffer.from(hex, "hex");
  },
});

// JSON type matching the previous Supabase-generated Json type
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── Tables ──────────────────────────────────────────────────────────────────

export const crossChainControllers = pgTable("CrossChainControllers", {
  chain_id: bigint("chain_id", { mode: "number" }).primaryKey(),
  address: varchar("address").notNull().default(""),
  rpc_block_limit: bigint("rpc_block_limit", { mode: "number" })
    .notNull()
    .default(500),
  created_block: bigint("created_block", { mode: "number" })
    .notNull()
    .default(0),
  rpc_urls: text("rpc_urls").array(),
  last_scanned_block: bigint("last_scanned_block", { mode: "number" }),
  chain_name_alias: text("chain_name_alias"),
  analytics_rpc_url: text("analytics_rpc_url"),
  native_token_name: text("native_token_name"),
  native_token_symbol: text("native_token_symbol"),
});

export const envelopes = pgTable("Envelopes", {
  id: text("id").primaryKey(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  message: byteaHex("message"),
  origin: varchar("origin"),
  destination: varchar("destination"),
  origin_chain_id: bigint("origin_chain_id", { mode: "number" }),
  destination_chain_id: bigint("destination_chain_id", { mode: "number" }),
  nonce: bigint("nonce", { mode: "number" }),
  registered_at: timestamp("registered_at", {
    withTimezone: true,
    mode: "string",
  }),
  proposal_id: text("proposal_id"),
  payload_id: bigint("payload_id", { mode: "number" }),
});

export const envelopeRegistered = pgTable(
  "EnvelopeRegistered",
  {
    transaction_hash: varchar("transaction_hash").notNull(),
    log_index: bigint("log_index", { mode: "number" }).notNull(),
    envelope_id: text("envelope_id"),
    block_number: bigint("block_number", { mode: "number" }),
    chain_id: bigint("chain_id", { mode: "number" }),
    timestamp: timestamp("timestamp", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    primaryKey({ columns: [table.transaction_hash, table.log_index] }),
  ],
);

export const envelopeDeliveryAttempted = pgTable(
  "EnvelopeDeliveryAttempted",
  {
    transaction_hash: varchar("transaction_hash").notNull(),
    log_index: bigint("log_index", { mode: "number" }).notNull(),
    envelope_id: text("envelope_id"),
    block_number: bigint("block_number", { mode: "number" }),
    is_delivered: boolean("is_delivered").notNull().default(false),
    chain_id: bigint("chain_id", { mode: "number" }),
    timestamp: timestamp("timestamp", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    primaryKey({ columns: [table.transaction_hash, table.log_index] }),
  ],
);

export const transactionForwardingAttempted = pgTable(
  "TransactionForwardingAttempted",
  {
    transaction_hash: varchar("transaction_hash").notNull(),
    log_index: bigint("log_index", { mode: "number" }).notNull(),
    envelope_id: text("envelope_id"),
    block_number: bigint("block_number", { mode: "number" }),
    chain_id: bigint("chain_id", { mode: "number" }),
    transaction_id: text("transaction_id"),
    destination_chain_id: bigint("destination_chain_id", { mode: "number" }),
    bridge_adapter: text("bridge_adapter"),
    destination_bridge_adapter: text("destination_bridge_adapter"),
    adapter_successful: boolean("adapter_successful"),
    return_data: byteaHex("return_data"),
    encoded_transaction: byteaHex("encoded_transaction"),
    timestamp: timestamp("timestamp", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    primaryKey({ columns: [table.transaction_hash, table.log_index] }),
  ],
);

export const transactionReceived = pgTable(
  "TransactionReceived",
  {
    transaction_hash: varchar("transaction_hash").notNull(),
    log_index: bigint("log_index", { mode: "number" }).notNull(),
    envelope_id: text("envelope_id").notNull(),
    block_number: bigint("block_number", { mode: "number" }).notNull(),
    chain_id: bigint("chain_id", { mode: "number" }),
    transaction_id: text("transaction_id"),
    origin_chain_id: bigint("origin_chain_id", { mode: "number" }),
    bridge_adapter: text("bridge_adapter"),
    confirmations: bigint("confirmations", { mode: "number" }),
    nonce: bigint("nonce", { mode: "number" }),
    encoded_envelope: byteaHex("encoded_envelope"),
    timestamp: timestamp("timestamp", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    primaryKey({ columns: [table.transaction_hash, table.log_index] }),
  ],
);

export const addressBook = pgTable(
  "AddressBook",
  {
    address: varchar("address").notNull(),
    chain_id: bigint("chain_id", { mode: "number" }).notNull(),
    name: text("name"),
  },
  (table) => [primaryKey({ columns: [table.address, table.chain_id] })],
);

export const bridgeExplorers = pgTable(
  "BridgeExplorers",
  {
    chain_id: bigint("chain_id", { mode: "number" }).notNull(),
    address: varchar("address").notNull(),
    explorer_link: text("explorer_link"),
  },
  (table) => [primaryKey({ columns: [table.chain_id, table.address] })],
);

export const retries = pgTable(
  "Retries",
  {
    from_block: bigint("from_block", { mode: "number" }).notNull(),
    to_block: bigint("to_block", { mode: "number" }).notNull(),
    chain_id: bigint("chain_id", { mode: "number" }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.from_block, table.to_block, table.chain_id],
    }),
  ],
);

export const sentNotifications = pgTable("SentNotifications", {
  notification_hash: text("notification_hash").primaryKey(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  data: jsonb("data").$type<Json>(),
});

export const transactionCosts = pgTable(
  "TransactionCosts",
  {
    transaction_hash: varchar("transaction_hash").notNull(),
    value: numericNumber("value"),
    token_address: varchar("token_address"),
    token_name: text("token_name"),
    token_usd_price: numericNumber("token_usd_price"),
    from: varchar("from").notNull(),
    to: varchar("to").notNull(),
    chain_id: bigint("chain_id", { mode: "number" }),
    token_symbol: text("token_symbol"),
    value_usd: numericNumber("value_usd"),
    log_index: bigint("log_index", { mode: "number" }).notNull(),
    timestamp: timestamp("timestamp", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    primaryKey({
      columns: [table.transaction_hash, table.from, table.to, table.log_index],
    }),
  ],
);

export const transactionGasCosts = pgTable("TransactionGasCosts", {
  transaction_hash: varchar("transaction_hash").primaryKey(),
  chain_id: bigint("chain_id", { mode: "number" }),
  gas_price: numericNumber("gas_price"),
  transaction_fee: numericNumber("transaction_fee"),
  transaction_fee_usd: numericNumber("transaction_fee_usd"),
  token_usd_price: numericNumber("token_usd_price"),
  token_name: text("token_name"),
  token_symbol: text("token_symbol"),
  timestamp: timestamp("timestamp", { withTimezone: true, mode: "string" }),
});

// ─── Relations ───────────────────────────────────────────────────────────────

export const envelopesRelations = relations(envelopes, ({ many }) => ({
  TransactionReceived: many(transactionReceived),
  EnvelopeDeliveryAttempted: many(envelopeDeliveryAttempted),
  TransactionForwardingAttempted: many(transactionForwardingAttempted),
  EnvelopeRegistered: many(envelopeRegistered),
}));

export const envelopeRegisteredRelations = relations(
  envelopeRegistered,
  ({ one }) => ({
    envelope: one(envelopes, {
      fields: [envelopeRegistered.envelope_id],
      references: [envelopes.id],
    }),
  }),
);

export const envelopeDeliveryAttemptedRelations = relations(
  envelopeDeliveryAttempted,
  ({ one }) => ({
    envelope: one(envelopes, {
      fields: [envelopeDeliveryAttempted.envelope_id],
      references: [envelopes.id],
    }),
  }),
);

export const transactionForwardingAttemptedRelations = relations(
  transactionForwardingAttempted,
  ({ one }) => ({
    envelope: one(envelopes, {
      fields: [transactionForwardingAttempted.envelope_id],
      references: [envelopes.id],
    }),
  }),
);

export const transactionReceivedRelations = relations(
  transactionReceived,
  ({ one }) => ({
    envelope: one(envelopes, {
      fields: [transactionReceived.envelope_id],
      references: [envelopes.id],
    }),
  }),
);
