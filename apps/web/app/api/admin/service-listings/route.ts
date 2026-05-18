import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

const allowedTypes = new Set(["beauty", "lab", "consultation", "partner", "media", "booking"]);

function normalizePayload(body: any) {
  return {
    service_type: body.service_type,
    name: body.name,
    category: body.category || "",
    city: body.city || "",
    area: body.area || "",
    description: body.description || "",
    services: Array.isArray(body.services)
      ? body.services
      : String(body.services || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
    price_range: body.price_range || "",
    phone: body.phone || "",
    whatsapp: body.whatsapp || "",
    website: body.website || "",
    image_url: body.image_url || "",
    gallery: Array.isArray(body.gallery)
      ? body.gallery
      : String(body.gallery || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
    address: body.address || "",
    lat: body.lat === "" || body.lat === undefined ? null : Number(body.lat),
    lng: body.lng === "" || body.lng === undefined ? null : Number(body.lng),
    rating: body.rating === "" || body.rating === undefined ? 0 : Number(body.rating),
    is_featured: Boolean(body.is_featured),
    is_active: body.is_active === undefined ? true : Boolean(body.is_active),
    sort_order: body.sort_order === "" || body.sort_order === undefined ? 0 : Number(body.sort_order),
    updated_at: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, services: [] });
    }

    const { data, error } = await supabaseAdmin
      .from("medical_services")
      .select("*")
      .order("service_type", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, services: data || [] });
  } catch (err: any) {
    console.error("Admin List Service Listings Error:", err);
    return NextResponse.json({ error: err.message || "تعذر تحميل الخدمات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "Supabase غير مهيأ. أضف متغيرات البيئة قبل الحفظ." }, { status: 503 });
    }

    const body = await request.json();
    if (!body.name || !body.service_type || !allowedTypes.has(body.service_type)) {
      return NextResponse.json({ error: "اسم الخدمة ونوعها مطلوبان" }, { status: 400 });
    }

    const payload = normalizePayload(body);
    const { data, error } = await supabaseAdmin
      .from("medical_services")
      .insert([{ ...payload, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, service: data });
  } catch (err: any) {
    console.error("Admin Add Service Listing Error:", err);
    return NextResponse.json({ error: err.message || "تعذر إضافة الخدمة" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "Supabase غير مهيأ. أضف متغيرات البيئة قبل التحديث." }, { status: 503 });
    }

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "معرف الخدمة مطلوب" }, { status: 400 });
    }
    if (body.service_type && !allowedTypes.has(body.service_type)) {
      return NextResponse.json({ error: "نوع الخدمة غير صالح" }, { status: 400 });
    }

    const payload = normalizePayload(body);
    const { data, error } = await supabaseAdmin
      .from("medical_services")
      .update(payload)
      .eq("id", body.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, service: data });
  } catch (err: any) {
    console.error("Admin Update Service Listing Error:", err);
    return NextResponse.json({ error: err.message || "تعذر تحديث الخدمة" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "Supabase غير مهيأ. أضف متغيرات البيئة قبل الحذف." }, { status: 503 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "معرف الخدمة مطلوب" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("medical_services").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Admin Delete Service Listing Error:", err);
    return NextResponse.json({ error: err.message || "تعذر حذف الخدمة" }, { status: 500 });
  }
}
