import { relations } from "drizzle-orm";
import {
  boolean,
  customType,
  integer,
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

// Custom type: bytea columns returned as hex strings (matching Supabase PostgREST behavior)
// Supabase returns bytea as `\xABCD...`, code does `.slice(2)` to strip prefix
const byteaHex = customType<{ data: string; driverData: Uint8Array }>({
  dataType() {
    return "bytea";
  },
  fromDriver(value: Uint8Array) {
    return "\\x" + Buffer.from(value).toString("hex");
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
  chain_id: integer("chain_id").primaryKey(),
  address: varchar("address").notNull().default(""),
  rpc_block_limit: integer("rpc_block_limit").notNull().default(500),
  created_block: integer("created_block").notNull().default(0),
  rpc_urls: text("rpc_urls").array(),
  last_scanned_block: integer("last_scanned_block"),
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
  origin_chain_id: integer("origin_chain_id"),
  destination_chain_id: integer("destination_chain_id"),
  nonce: integer("nonce"),
  registered_at: timestamp("registered_at", {
    withTimezone: true,
    mode: "string",
  }),
  proposal_id: integer("proposal_id"),
  payload_id: integer("payload_id"),
});

export const envelopeRegistered = pgTable(
  "EnvelopeRegistered",
  {
    transaction_hash: varchar("transaction_hash").notNull(),
    log_index: integer("log_index").notNull(),
    envelope_id: text("envelope_id"),
    block_number: integer("block_number"),
    chain_id: integer("chain_id"),
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
    log_index: integer("log_index").notNull(),
    envelope_id: text("envelope_id"),
    block_number: integer("block_number"),
    is_delivered: boolean("is_delivered").notNull().default(false),
    chain_id: integer("chain_id"),
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
    log_index: integer("log_index").notNull(),
    envelope_id: text("envelope_id"),
    block_number: integer("block_number"),
    chain_id: integer("chain_id"),
    transaction_id: text("transaction_id"),
    destination_chain_id: integer("destination_chain_id"),
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
    log_index: integer("log_index").notNull(),
    envelope_id: text("envelope_id").notNull(),
    block_number: integer("block_number").notNull(),
    chain_id: integer("chain_id"),
    transaction_id: text("transaction_id"),
    origin_chain_id: integer("origin_chain_id"),
    bridge_adapter: text("bridge_adapter"),
    confirmations: integer("confirmations"),
    nonce: integer("nonce"),
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
    chain_id: integer("chain_id").notNull(),
    name: text("name"),
  },
  (table) => [primaryKey({ columns: [table.address, table.chain_id] })],
);

export const bridgeExplorers = pgTable(
  "BridgeExplorers",
  {
    chain_id: integer("chain_id").notNull(),
    address: varchar("address").notNull(),
    explorer_link: text("explorer_link"),
  },
  (table) => [primaryKey({ columns: [table.chain_id, table.address] })],
);

export const retries = pgTable(
  "Retries",
  {
    from_block: integer("from_block").notNull(),
    to_block: integer("to_block").notNull(),
    chain_id: integer("chain_id").notNull(),
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
    chain_id: integer("chain_id"),
    token_symbol: text("token_symbol"),
    value_usd: numericNumber("value_usd"),
    log_index: integer("log_index").notNull(),
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
  chain_id: integer("chain_id"),
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
