# a.DI Dashboard

![AAVE Delivery Infrastructure Dashboard](https://github.com/bgd-labs/adi-dashboard/assets/2552715/f3889a91-0385-4dd0-9b98-b59fdb6c4363)

This Dashboard facilitates monitoring of the [Aave Delivery Infrastructure](https://github.com/bgd-labs/aave-delivery-infrastructure), offering a simplified interface for browsing envelopes, reading messages, and examining payloads. Links to the Governance V3 interface are provided for easy access to proposals and payloads. The dashboard also includes Slack integration for alerts on events requiring immediate attention.

This application performs scans on configured chains every two minutes, capturing new events emitted by `CrossChainController` contracts and storing them in a database. In the event of an RPC query range failure, the application will automatically retry during the next retry cycle, which occurs every 5 minutes. The app's status page provides an overview of the scan progress and details of the specific ranges.

Delivery of an envelope is confirmed upon reaching consensus and logging a successful `EnvelopeDeliveryAttempted` event. Envelopes not delivered within 60 minutes are marked as delivery failures, triggering a notification on Slack.

The application uses [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/) for data storage, and [tRPC](https://trpc.io/) for type-safe data operations. The front-end is built with [Next.js](https://nextjs.org/) and styled with [Tailwind CSS](https://tailwindcss.com/). Scheduled scans run via [Vercel Cron Jobs](https://vercel.com/guides/how-to-setup-cron-jobs-on-vercel) and notifications are sent through the [Slack API](https://api.slack.com/).

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/)
- [PostgreSQL](https://www.postgresql.org/) database

## Getting started

Clone the repository:

```bash
git clone git@github.com:bgd-labs/adi-dashboard.git
cd adi-dashboard
```

### Set up the database

Create a PostgreSQL database and push the schema:

```bash
npx drizzle-kit push
```

### Set environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

The key variable is `DATABASE_URL` — a PostgreSQL connection string (e.g. `postgresql://user:password@host:5432/dbname`).

### Install and run

```bash
pnpm install
pnpm dev
```

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Faave-dao%2Fadi-dashboard&env=DATABASE_URL,CRON_SECRET,SLACK_BOT_TOKEN,SLACK_CHANNEL_ID,ICON_GENERATOR_KEY,ENVIRONMENT_STAGE,COINGECKO_API_KEY,ALCHEMY_API_KEY)

The app is designed for [Vercel](https://vercel.com/). Set these environment variables in your Vercel project:

- `DATABASE_URL` — PostgreSQL connection string
- `CRON_SECRET` — protects cron API endpoints
- `SLACK_BOT_TOKEN` / `SLACK_CHANNEL_ID` — Slack notifications
- `ICON_GENERATOR_KEY` — protects the icon generator endpoint
- `ENVIRONMENT_STAGE` — `PROD` or `PREPROD`
- `COINGECKO_API_KEY` — for token price data
- `ALCHEMY_API_KEY` — for transaction tracing

Cron schedules are configured in `vercel.json`.

## Adding a new chain

To monitor a new chain, the chain must be supported by the [viem/chains](https://viem.sh/docs/chains/introduction) package.

Insert a new row into the `CrossChainControllers` table:

```sql
INSERT INTO "CrossChainControllers" (
  chain_id, address, created_block, rpc_urls, rpc_block_limit,
  chain_name_alias, native_token_name, native_token_symbol
) VALUES (
  42161,
  '0x...CrossChainController address...',
  12345678,
  ARRAY['https://arb1.arbitrum.io/rpc'],
  500,
  'Arbitrum',
  'Ethereum',
  'ETH'
);
```

**Required fields:** `chain_id`, `address`, `created_block`, `rpc_urls`

**Optional fields:** `rpc_block_limit` (default 500), `chain_name_alias`, `analytics_rpc_url`, `native_token_name`, `native_token_symbol`

To enable low-balance alerts for the new chain, add thresholds in `src/app/api/cron/notify/balances/route.ts`.

Scanning starts automatically on the next cron cycle (every 2 minutes).

## License

Copyright © 2024, Aave DAO, represented by its governance smart contracts.

Created by [BGD Labs](https://bgdlabs.com/).

The default license of this repository is [BUSL1.1](./LICENSE).

**IMPORTANT**. The BUSL1.1 license of this repository allows for any usage of the software, if respecting the _Additional Use Grant_ limitations, forbidding any use case damaging anyhow the Aave DAO's interests.
