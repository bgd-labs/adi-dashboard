import { NextResponse } from "next/server";

import { getCrossChainControllers } from "@/server/eventCollection/getCrossChainControllers";

export const GET = async () => {
  try {
    const controllers = await getCrossChainControllers();

    return NextResponse.json({
      success: true,
      controllersCount: controllers.length,
      controllers: controllers,
      environment: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        region: process.env.VERCEL_REGION,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        environment: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV,
          region: process.env.VERCEL_REGION,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
};
