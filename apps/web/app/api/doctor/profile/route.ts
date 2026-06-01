import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getDoctorSession } from "@/lib/doctor-session";

export async function PATCH(request: Request) {
  try {
    const session = await getDoctorSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const update = {
      phone: body.phone || "",
      whatsapp: body.whatsapp || "",
      city: body.city || "",
      area: body.area || "",
      address: body.address || "",
      bio: body.bio || "",
      working_hours: body.working_hours || {},
      is_available: Boolean(body.is_available),
      availability_note: body.availability_note || "",
    };

    const { data, error } = await supabaseAdmin
      .from("doctors")
      .update(update)
      .eq("id", session.doctor_id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, doctor: data });
  } catch (err: any) {
    console.error("Doctor profile update error:", err);
    return NextResponse.json({ error: err.message || "تعذر تحديث بيانات العيادة" }, { status: 500 });
  }
}
