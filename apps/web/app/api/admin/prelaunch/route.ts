import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { getPrelaunchSettings, updatePrelaunchSettings } from "@/lib/prelaunch";

export async function GET(request: Request) {
  try {
    const admin = await getAdminSession(request);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const settings = await getPrelaunchSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "تعذر جلب الإعداد" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAdminSession(request);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const settings = await updatePrelaunchSettings({
      enabled: Boolean(body.enabled),
      title: String(body.title || ""),
      message: String(body.message || ""),
    });

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "تعذر حفظ الإعداد" }, { status: 500 });
  }
}
