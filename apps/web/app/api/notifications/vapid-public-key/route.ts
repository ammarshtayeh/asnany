import { NextResponse } from "next/server";
import { getVapidPublicKey, isWebPushConfigured } from "@/lib/web-push";

export async function GET() {
  if (!isWebPushConfigured()) {
    return NextResponse.json({ enabled: false, publicKey: null });
  }

  return NextResponse.json({
    enabled: true,
    publicKey: getVapidPublicKey(),
  });
}
