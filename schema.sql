
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE SCHEMA IF NOT EXISTS "public";

ALTER SCHEMA "public" OWNER TO "pg_database_owner";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."AddressBook" (
    "address" character varying NOT NULL,
    "chain_id" bigint NOT NULL,
    "name" "text"
);

ALTER TABLE "public"."AddressBook" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."BridgeExplorers" (
    "chain_id" bigint NOT NULL,
    "address" character varying NOT NULL,
    "explorer_link" "text"
);

ALTER TABLE "public"."BridgeExplorers" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."CrossChainControllers" (
    "chain_id" bigint NOT NULL,
    "address" character varying DEFAULT ''::character varying NOT NULL,
    "rpc_block_limit" bigint DEFAULT '500'::bigint NOT NULL,
    "created_block" bigint DEFAULT '0'::bigint NOT NULL,
    "rpc_urls" "text"[],
    "last_scanned_block" bigint,
    "chain_name_alias" "text",
    "quicknode_rpc_url" "text"
);

ALTER TABLE "public"."CrossChainControllers" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."EnvelopeDeliveryAttempted" (
    "transaction_hash" character varying NOT NULL,
    "log_index" bigint NOT NULL,
    "envelope_id" "text",
    "block_number" bigint,
    "is_delivered" boolean DEFAULT false NOT NULL,
    "chain_id" bigint,
    "timestamp" timestamp with time zone
);

ALTER TABLE "public"."EnvelopeDeliveryAttempted" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."EnvelopeRegistered" (
    "transaction_hash" character varying NOT NULL,
    "log_index" bigint NOT NULL,
    "envelope_id" "text",
    "block_number" bigint,
    "chain_id" bigint,
    "timestamp" timestamp with time zone
);

ALTER TABLE "public"."EnvelopeRegistered" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."Envelopes" (
    "id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "message" "bytea",
    "origin" character varying,
    "destination" character varying,
    "origin_chain_id" bigint,
    "destination_chain_id" bigint,
    "nonce" bigint,
    "registered_at" timestamp with time zone
);

ALTER TABLE "public"."Envelopes" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."Notifications" (
    "envelope_id" "text" NOT NULL,
    "transaction_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."Notifications" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."Retries" (
    "from_block" bigint NOT NULL,
    "to_block" bigint NOT NULL,
    "chain_id" bigint NOT NULL
);

ALTER TABLE "public"."Retries" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."TransactionCosts" (
    "tx_hash" character varying NOT NULL,
    "value" bigint,
    "token_address" character varying,
    "token_name" "text",
    "usd_value" bigint,
    "from" character varying NOT NULL,
    "to" character varying NOT NULL,
    "chain_id" bigint
);

ALTER TABLE "public"."TransactionCosts" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."TransactionForwardingAttempted" (
    "transaction_hash" character varying NOT NULL,
    "log_index" bigint NOT NULL,
    "envelope_id" "text",
    "block_number" bigint,
    "chain_id" bigint,
    "transaction_id" "text",
    "destination_chain_id" bigint,
    "bridge_adapter" "text",
    "destination_bridge_adapter" "text",
    "adapter_successful" boolean,
    "return_data" "bytea",
    "encoded_transaction" "bytea",
    "timestamp" timestamp with time zone
);

ALTER TABLE "public"."TransactionForwardingAttempted" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."TransactionReceived" (
    "transaction_hash" character varying NOT NULL,
    "log_index" bigint NOT NULL,
    "envelope_id" "text" NOT NULL,
    "block_number" bigint NOT NULL,
    "chain_id" bigint,
    "transaction_id" "text",
    "origin_chain_id" bigint,
    "bridge_adapter" "text",
    "confirmations" bigint,
    "nonce" bigint,
    "encoded_envelope" "bytea",
    "timestamp" timestamp with time zone
);

ALTER TABLE "public"."TransactionReceived" OWNER TO "postgres";

ALTER TABLE ONLY "public"."AddressBook"
    ADD CONSTRAINT "AddressBook_pkey" PRIMARY KEY ("address", "chain_id");

ALTER TABLE ONLY "public"."BridgeExplorers"
    ADD CONSTRAINT "BridgeExplorers_pkey" PRIMARY KEY ("chain_id", "address");

ALTER TABLE ONLY "public"."CrossChainControllers"
    ADD CONSTRAINT "CrossChainControllers_pkey" PRIMARY KEY ("chain_id");

ALTER TABLE ONLY "public"."EnvelopeDeliveryAttempted"
    ADD CONSTRAINT "EnvelopeDeliveryAttempted_pkey" PRIMARY KEY ("transaction_hash", "log_index");

ALTER TABLE ONLY "public"."EnvelopeRegistered"
    ADD CONSTRAINT "EnvelopeRegistered_pkey" PRIMARY KEY ("transaction_hash", "log_index");

ALTER TABLE ONLY "public"."Notifications"
    ADD CONSTRAINT "Notifications_pkey" PRIMARY KEY ("envelope_id", "transaction_id");

ALTER TABLE ONLY "public"."Retries"
    ADD CONSTRAINT "Retries_pkey" PRIMARY KEY ("from_block", "to_block", "chain_id");

ALTER TABLE ONLY "public"."TransactionCosts"
    ADD CONSTRAINT "TransactionCosts_pkey" PRIMARY KEY ("tx_hash", "from", "to");

ALTER TABLE ONLY "public"."Envelopes"
    ADD CONSTRAINT "envelopes_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."TransactionForwardingAttempted"
    ADD CONSTRAINT "transactionforwardingattempted_pkey" PRIMARY KEY ("transaction_hash", "log_index");

ALTER TABLE ONLY "public"."TransactionReceived"
    ADD CONSTRAINT "transactionreceived_pkey" PRIMARY KEY ("transaction_hash", "log_index");

ALTER TABLE ONLY "public"."AddressBook"
    ADD CONSTRAINT "AddressBook_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "public"."CrossChainControllers"("chain_id");

ALTER TABLE ONLY "public"."EnvelopeDeliveryAttempted"
    ADD CONSTRAINT "EnvelopeDeliveryAttempted_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "public"."CrossChainControllers"("chain_id");

ALTER TABLE ONLY "public"."EnvelopeDeliveryAttempted"
    ADD CONSTRAINT "EnvelopeDeliveryAttempted_envelope_id_fkey" FOREIGN KEY ("envelope_id") REFERENCES "public"."Envelopes"("id");

ALTER TABLE ONLY "public"."EnvelopeRegistered"
    ADD CONSTRAINT "EnvelopeRegistered_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "public"."CrossChainControllers"("chain_id");

ALTER TABLE ONLY "public"."EnvelopeRegistered"
    ADD CONSTRAINT "EnvelopeRegistered_envelope_id_fkey" FOREIGN KEY ("envelope_id") REFERENCES "public"."Envelopes"("id");

ALTER TABLE ONLY "public"."Notifications"
    ADD CONSTRAINT "Notifications_envelope_id_fkey" FOREIGN KEY ("envelope_id") REFERENCES "public"."Envelopes"("id");

ALTER TABLE ONLY "public"."Retries"
    ADD CONSTRAINT "Retries_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "public"."CrossChainControllers"("chain_id");

ALTER TABLE ONLY "public"."TransactionForwardingAttempted"
    ADD CONSTRAINT "TransactionForwardingAttempted_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "public"."CrossChainControllers"("chain_id");

ALTER TABLE ONLY "public"."TransactionForwardingAttempted"
    ADD CONSTRAINT "TransactionForwardingAttempted_destination_chain_id_fkey" FOREIGN KEY ("destination_chain_id") REFERENCES "public"."CrossChainControllers"("chain_id");

ALTER TABLE ONLY "public"."TransactionForwardingAttempted"
    ADD CONSTRAINT "TransactionForwardingAttempted_envelope_id_fkey" FOREIGN KEY ("envelope_id") REFERENCES "public"."Envelopes"("id");

ALTER TABLE ONLY "public"."TransactionReceived"
    ADD CONSTRAINT "TransactionReceived_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "public"."CrossChainControllers"("chain_id");

ALTER TABLE ONLY "public"."TransactionReceived"
    ADD CONSTRAINT "TransactionReceived_envelope_id_fkey" FOREIGN KEY ("envelope_id") REFERENCES "public"."Envelopes"("id");

ALTER TABLE ONLY "public"."TransactionReceived"
    ADD CONSTRAINT "TransactionReceived_origin_chain_id_fkey" FOREIGN KEY ("origin_chain_id") REFERENCES "public"."CrossChainControllers"("chain_id");

ALTER TABLE ONLY "public"."BridgeExplorers"
    ADD CONSTRAINT "public_BridgeExplorers_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "public"."CrossChainControllers"("chain_id");

ALTER TABLE ONLY "public"."TransactionCosts"
    ADD CONSTRAINT "public_TransactionCosts_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "public"."CrossChainControllers"("chain_id");

ALTER TABLE "public"."AddressBook" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."BridgeExplorers" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."CrossChainControllers" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON "public"."AddressBook" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."BridgeExplorers" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."CrossChainControllers" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."EnvelopeDeliveryAttempted" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."EnvelopeRegistered" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."Envelopes" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."Retries" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."TransactionForwardingAttempted" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."TransactionReceived" FOR SELECT USING (true);

ALTER TABLE "public"."EnvelopeDeliveryAttempted" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."EnvelopeRegistered" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Envelopes" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Notifications" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Retries" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."TransactionCosts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."TransactionForwardingAttempted" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."TransactionReceived" ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON TABLE "public"."AddressBook" TO "anon";
GRANT ALL ON TABLE "public"."AddressBook" TO "authenticated";
GRANT ALL ON TABLE "public"."AddressBook" TO "service_role";

GRANT ALL ON TABLE "public"."BridgeExplorers" TO "anon";
GRANT ALL ON TABLE "public"."BridgeExplorers" TO "authenticated";
GRANT ALL ON TABLE "public"."BridgeExplorers" TO "service_role";

GRANT ALL ON TABLE "public"."CrossChainControllers" TO "anon";
GRANT ALL ON TABLE "public"."CrossChainControllers" TO "authenticated";
GRANT ALL ON TABLE "public"."CrossChainControllers" TO "service_role";

GRANT ALL ON TABLE "public"."EnvelopeDeliveryAttempted" TO "anon";
GRANT ALL ON TABLE "public"."EnvelopeDeliveryAttempted" TO "authenticated";
GRANT ALL ON TABLE "public"."EnvelopeDeliveryAttempted" TO "service_role";

GRANT ALL ON TABLE "public"."EnvelopeRegistered" TO "anon";
GRANT ALL ON TABLE "public"."EnvelopeRegistered" TO "authenticated";
GRANT ALL ON TABLE "public"."EnvelopeRegistered" TO "service_role";

GRANT ALL ON TABLE "public"."Envelopes" TO "anon";
GRANT ALL ON TABLE "public"."Envelopes" TO "authenticated";
GRANT ALL ON TABLE "public"."Envelopes" TO "service_role";

GRANT ALL ON TABLE "public"."Notifications" TO "anon";
GRANT ALL ON TABLE "public"."Notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."Notifications" TO "service_role";

GRANT ALL ON TABLE "public"."Retries" TO "anon";
GRANT ALL ON TABLE "public"."Retries" TO "authenticated";
GRANT ALL ON TABLE "public"."Retries" TO "service_role";

GRANT ALL ON TABLE "public"."TransactionCosts" TO "anon";
GRANT ALL ON TABLE "public"."TransactionCosts" TO "authenticated";
GRANT ALL ON TABLE "public"."TransactionCosts" TO "service_role";

GRANT ALL ON TABLE "public"."TransactionForwardingAttempted" TO "anon";
GRANT ALL ON TABLE "public"."TransactionForwardingAttempted" TO "authenticated";
GRANT ALL ON TABLE "public"."TransactionForwardingAttempted" TO "service_role";

GRANT ALL ON TABLE "public"."TransactionReceived" TO "anon";
GRANT ALL ON TABLE "public"."TransactionReceived" TO "authenticated";
GRANT ALL ON TABLE "public"."TransactionReceived" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
