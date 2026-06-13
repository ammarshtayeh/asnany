import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("doctor_accounts")
      .select("id, doctor_id, email, is_active, created_at, doctors(id, name, city, phone, specialty)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, accounts: data || [], doctors: data || [] });
  } catch (err: any) {
    console.error("Doctor accounts list error:", err);
    return NextResponse.json({ error: err.message || "تعذر تحميل حسابات الأطباء" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { doctor_id, email, password, is_active = true } = body;

    if (!doctor_id && (body.full_name || body.name)) {
      const specialty = body.specialty
        ? String(body.specialty).split(",").map((item) => item.trim()).filter(Boolean)
        : ["أسنان"];
      const { data: doctor, error: doctorError } = await supabaseAdmin
        .from("doctors")
        .insert([{
          name: body.full_name || body.name,
          category: body.category || "أسنان",
          specialty,
          city: body.city || "",
          area: body.area || "",
          phone: body.phone || "",
          whatsapp: body.whatsapp || "",
          discount_value: body.discount_value || null,
          discount_note: body.discount_note || null,
          accepts_discount_card: Boolean(body.discount_value || body.discount_note),
          accepts_insurance: false,
          verified: true,
          is_featured: false,
          rating: 5,
          image_url: body.image_url || "",
          clinic_photos: [],
          working_hours: {},
        }])
        .select("id")
        .single();

      if (doctorError) throw doctorError;
      doctor_id = doctor.id;
    }
    if (!doctor_id || !email || !password) {
      return NextResponse.json({ error: "الطبيب والبريد وكلمة المرور مطلوبة" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("doctor_accounts")
      .upsert({ doctor_id, email, password, is_active }, { onConflict: "email" })
      .select("id, doctor_id, email, is_active, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, account: data });
  } catch (err: any) {
    console.error("Doctor account create error:", err);
    return NextResponse.json({ error: err.message || "تعذر إنشاء حساب الطبيب" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, is_active, password } = body;
    if (!id) return NextResponse.json({ error: "معرف الحساب مطلوب" }, { status: 400 });

    const update: Record<string, any> = {};
    if (typeof is_active === "boolean") update.is_active = is_active;
    if (password && password.length >= 6) update.password = password;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "لا توجد بيانات للتحديث" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("doctor_accounts")
      .update(update)
      .eq("id", id)
      .select("id, doctor_id, email, is_active, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, account: data });
  } catch (err: any) {
    console.error("Doctor account update error:", err);
    return NextResponse.json({ error: err.message || "تعذر تحديث حساب الطبيب" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "معرف الحساب مطلوب" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from("doctor_accounts")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Doctor account delete error:", err);
    return NextResponse.json({ error: err.message || "تعذر حذف حساب الطبيب" }, { status: 500 });
  }
}
