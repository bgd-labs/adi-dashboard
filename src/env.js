import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    SUPABASE_SERVICE_KEY: z.string(),
    CRON_SECRET: z.string(),
    SLACK_WEBHOOK_URL: z.string(),
    ICON_GENERATOR_KEY: z.string(),
    ENVIRONMENT_STAGE: z.enum(["PROD", "PREPROD"]),
    COINGECKO_API_KEY: z.string(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string(),
    NEXT_PUBLIC_SUPABASE_KEY: z.string(),
    NEXT_PUBLIC_WC_PROJECT_ID: z.string(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
    NEXT_PUBLIC_SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
    ICON_GENERATOR_KEY: process.env.ICON_GENERATOR_KEY,
    ENVIRONMENT_STAGE: process.env.ENVIRONMENT_STAGE,
    COINGECKO_API_KEY: process.env.COINGECKO_API_KEY,
    NEXT_PUBLIC_WC_PROJECT_ID: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
