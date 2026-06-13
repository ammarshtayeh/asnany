import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function toCoordinate(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return Number(value);
  return Number.NaN;
}

function isInPalestineBounds(lat: number, lng: number) {
  return lat >= 31 && lat <= 33 && lng >= 34 && lng <= 36;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const doctorId = body.doctor_id || body.doctorId;
    const lat = toCoordinate(body.lat ?? body.latitude);
    const lng = toCoordinate(body.lng ?? body.longitude);

    if (!doctorId || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: "بيانات الموقع غير كاملة" }, { status: 400 });
    }

    if (!isInPalestineBounds(lat, lng)) {
      return NextResponse.json({ error: "الإحداثيات خارج النطاق المتوقع لفلسطين" }, { status: 400 });
    }

    const updates: Record<string, unknown> = { lat, lng };
    if (typeof body.city === "string") updates.city = body.city.trim();
    if (typeof body.area === "string") updates.area = body.area.trim();
    if (typeof body.address === "string") updates.address = body.address.trim();

    const { data, error } = await supabaseAdmin
      .from("doctors")
      .update(updates)
      .eq("id", doctorId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, doctor: data });
  } catch (err: any) {
    console.error("Set Doctor Location Error:", err);
    return NextResponse.json({ error: err.message || "حدث خطأ أثناء حفظ الموقع" }, { status: 500 });
  }
}
