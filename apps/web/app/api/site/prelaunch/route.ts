import { NextResponse } from "next/server";
import { getPrelaunchSettings } from "@/lib/prelaunch";

export const revalidate = 15;

export async function GET() {
  try {
    const settings = await getPrelaunchSettings();
    return NextResponse.json(settings, {
      headers: {
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
      },
    });
  } catch (error: any) {
    console.error("GET /api/site/prelaunch error:", error);
    return NextResponse.json(
      { enabled: false, title: "قريباً", message: "ترقّبوا إطلاق ملامح في فلسطين", updatedAt: null },
      { status: 200 }
    );
  }
}
