import { supabaseAdmin } from "@/server/api/supabase";

import { type CrossChainController } from "./types";

export const getCrossChainControllers = async (): Promise<
  CrossChainController[]
> => {
  // Ensure environment variables are available
  if (
    !process.env.SUPABASE_SERVICE_KEY ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  ) {
    console.error("Missing required environment variables:", {
      hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    });
    throw new Error(
      "Missing required environment variables for database connection. Check SUPABASE_SERVICE_KEY and NEXT_PUBLIC_SUPABASE_URL.",
    );
  }

  const { data: chrossChainControllers, error } = await supabaseAdmin.from(
    "CrossChainControllers",
  ).select(`
    chain_id,
    address,
    created_block,
    last_scanned_block,
    rpc_urls,
    rpc_block_limit
  `);

  if (error) {
    console.error("Database error in getCrossChainControllers:", error);
    console.error("Environment context:", {
      hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      region: process.env.VERCEL_REGION,
    });
    throw new Error(
      `Database error: ${error.message}. Code: ${error.code}. Check your database connection and permissions.`,
    );
  }

  if (!chrossChainControllers || chrossChainControllers.length === 0) {
    console.error("No CrossChainControllers found - table is empty");
    console.error("Environment context:", {
      hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      region: process.env.VERCEL_REGION,
    });
    throw new Error(
      "No CrossChainControllers found in configuration. Check your database - the table exists but is empty.",
    );
  }

  return chrossChainControllers;
};
