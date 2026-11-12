import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const cmsConfigured = Boolean(process.env.CMS_API_URL?.trim());

  return NextResponse.json(
    {
      status: cmsConfigured ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        cmsApiUrl: cmsConfigured,
      },
    },
    {
      status: cmsConfigured ? 200 : 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }
  );
}
