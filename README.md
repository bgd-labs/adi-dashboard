# a.DI Dashboard

![AAVE Delivery Infrastructure Dashboard](https://github.com/bgd-labs/adi-dashboard/assets/2552715/f3889a91-0385-4dd0-9b98-b59fdb6c4363)

This Dashboard facilitates monitoring of the [Aave Delivery Infrastructure](https://github.com/bgd-labs/aave-delivery-infrastructure), offering a simplified interface for browsing envelopes, reading messages, and examining payloads. Links to the Governance V3 interface are provided for easy access to proposals and payloads. The dashboard also includes Slack integration for alerts on events requiring immediate attention.

This application performs scans on configured chains every two minutes, capturing new events emitted by `CrossChainController` contracts and storing them in a database. In the event of an RPC query range failure, the application will automatically retry during the next retry cycle, which occurs every 5 minutes. The app's status page provides an overview of the scan progress and details of the specific ranges.

Delivery of an envelope is confirmed upon reaching consensus and logging a successful `EnvelopeDeliveryAttempted` event. Envelopes not delivered within 60 minutes are marked as delivery failures, triggering a notification on Slack.

The application uses [Supabase](https://supabase.io/) for event data storage and retrieval, and [tRPC](https://trpc.io/) for type-safe data operations. The front-end interface is built with [Next.js](https://nextjs.org/), and styled with [Tailwind CSS](https://tailwindcss.com/). The app also relies on [Vercel Cron Jobs](https://vercel.com/guides/how-to-setup-cron-jobs-on-vercel) for scheduled scans and [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks) for notifications.

## Getting started

First, clone the repository and navigate to the project directory.

```bash
git clone git@github.com:bgd-labs/adi-dashboard.git
cd adi-dashboard
```

### Set up Supabase

Create a new project on [Supabase](https://supabase.io/) and set up a new database. use `schema.sql` to create the required tables and views. Next, update the app configuration by editing `CrossChainControllers` and `AddressBook` tables with the addresses of the deployed contracts.

### Set Environment Variables

Copy the `.env.example` file to `.env.local` and fill in the required environment variables (See comments in `.env.example` file for reference).

```bash
cp .env.example .env.local
```

To get started, you will need to install the dependencies and run the development server.

```bash
npm install
npm run dev
```

### Update/Generate Database Types

When the database structure is updated, in order to generate files, you can generate type definitions for the database using the Supabase CLI:

```bash
npm install -g @supabase/cli
```

```bash
cd ./src/server/api && supabase gen types typescript --project-id YOUR_SUPABASE_PROJECT_ID > ./database.types.ts
```

Alternatively, you can use download the types from the Supabase dashboard and place them in the `./src/server/api` folder.


## License

Copyright © 2024, Aave DAO, represented by its governance smart contracts.

Created by [BGD Labs](https://bgdlabs.com/).

The default license of this repository is [BUSL1.1](./LICENSE).

**IMPORTANT**. The BUSL1.1 license of this repository allows for any usage of the software, if respecting the *Additional Use Grant* limitations, forbidding any use case damaging anyhow the Aave DAO's interests.