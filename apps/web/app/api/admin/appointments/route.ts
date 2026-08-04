import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { notifyPatientAboutAppointmentStatus } from "@/lib/notifications";
import { attachDiscountCardStatus, isMissingDiscountMemberTable } from "@/lib/discount-card-members";

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, appointments: [] });
    }

    const { data, error } = await supabaseAdmin
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    let appointments = data || [];
    const { data: members, error: membersError } = await supabaseAdmin
      .from("discount_card_members")
      .select("*")
      .eq("status", "active");

    if (membersError) {
      if (!isMissingDiscountMemberTable(membersError)) throw membersError;
    } else {
      appointments = attachDiscountCardStatus(data || [], members || []);
    }

    return NextResponse.json({ success: true, appointments });
  } catch (err: any) {
    console.error("Admin appointments list error:", err);
    return NextResponse.json({ error: err.message || "تعذر تحميل المواعيد" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "Supabase غير مهيأ" }, { status: 503 });
    }

    const { id, status } = await request.json();
    const allowed = new Set(["pending", "confirmed", "cancelled", "completed"]);
    if (!id || !status) {
      return NextResponse.json({ error: "المعرف والحالة مطلوبان" }, { status: 400 });
    }
    if (!allowed.has(String(status))) {
      return NextResponse.json({ error: "حالة الموعد غير صالحة" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("appointments")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    await notifyPatientAboutAppointmentStatus(data);
    return NextResponse.json({ success: true, appointment: data });
  } catch (err: any) {
    console.error("Admin appointments update error:", err);
    return NextResponse.json({ error: err.message || "تعذر تحديث الموعد" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "Supabase غير مهيأ" }, { status: 503 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "معرف الموعد مطلوب" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("appointments").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Admin appointments delete error:", err);
    return NextResponse.json({ error: err.message || "تعذر حذف الموعد" }, { status: 500 });
  }
}
