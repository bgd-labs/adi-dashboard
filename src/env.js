import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    DATABASE_URL: z.string(),
    CRON_SECRET: z.string(),
    SLACK_BOT_TOKEN: z.string(),
    SLACK_CHANNEL_ID: z.string(),
    ICON_GENERATOR_KEY: z.string(),
    ENVIRONMENT_STAGE: z.enum(["PROD", "PREPROD"]),
    COINGECKO_API_KEY: z.string(),
    ALCHEMY_API_KEY: z.string(),
  },
  client: {},
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    CRON_SECRET: process.env.CRON_SECRET,
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    SLACK_CHANNEL_ID: process.env.SLACK_CHANNEL_ID,
    ICON_GENERATOR_KEY: process.env.ICON_GENERATOR_KEY,
    ENVIRONMENT_STAGE: process.env.ENVIRONMENT_STAGE,
    COINGECKO_API_KEY: process.env.COINGECKO_API_KEY,
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
