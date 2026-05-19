import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

const resources = {
  offers: {
    table: "offers",
    order: "created_at",
    required: ["title", "doctor_name"],
  },
  articles: {
    table: "articles",
    order: "created_at",
    required: ["title", "content", "doctor_name"],
  },
  marketplace_ads: {
    table: "marketplace_ads",
    order: "created_at",
    required: ["title", "publisher", "phone"],
  },
} as const;

type Resource = keyof typeof resources;

function getResource(value: unknown): Resource | null {
  if (typeof value !== "string") return null;
  return value in resources ? (value as Resource) : null;
}

function cleanNumber(value: unknown) {
  if (value === "" || value === undefined || value === null) return null;
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
}

function normalize(resource: Resource, body: any) {
  if (resource === "offers") {
    return {
      title: body.title || "",
      description: body.description || "",
      doctor_id: body.doctor_id || null,
      doctor_name: body.doctor_name || "",
      discount_percentage: cleanNumber(body.discount_percentage) ?? 0,
      original_price: cleanNumber(body.original_price),
      discounted_price: cleanNumber(body.discounted_price),
      image_url: body.image_url || "",
      valid_until: body.valid_until || null,
    };
  }

  if (resource === "articles") {
    return {
      title: body.title || "",
      excerpt: body.excerpt || "",
      content: body.content || "",
      image_url: body.image_url || "",
      doctor_id: body.doctor_id || null,
      doctor_name: body.doctor_name || "",
      category: body.category || "",
      date: body.date || new Date().toISOString().split("T")[0],
      read_time: body.read_time || "",
    };
  }

  return {
    title: body.title || "",
    type: body.type === "job" ? "job" : "equipment",
    category: body.category || "",
    price: body.price || "",
    salary: body.salary || "",
    publisher: body.publisher || "",
    city: body.city || "",
    date: body.date || new Date().toISOString().split("T")[0],
    is_featured: Boolean(body.is_featured),
    is_active: body.is_active === undefined ? true : Boolean(body.is_active),
    image_url: body.image_url || "",
    description: body.description || "",
    phone: body.phone || "",
  };
}

function validate(resource: Resource, payload: Record<string, unknown>) {
  const missing = resources[resource].required.filter((key) => !String(payload[key] || "").trim());
  return missing.length === 0;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const resource = getResource(url.searchParams.get("resource"));
    if (!resource) {
      return NextResponse.json({ error: "قسم المحتوى غير صالح" }, { status: 400 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, items: [] });
    }

    const config = resources[resource];
    const { data, error } = await supabaseAdmin
      .from(config.table)
      .select("*")
      .order(config.order, { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, items: data || [] });
  } catch (err: any) {
    console.error("Admin content list error:", err);
    return NextResponse.json({ error: err.message || "تعذر تحميل المحتوى" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const resource = getResource(body.resource);
    if (!resource) {
      return NextResponse.json({ error: "قسم المحتوى غير صالح" }, { status: 400 });
    }
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "Supabase غير مهيأ" }, { status: 503 });
    }

    const payload = normalize(resource, body);
    if (!validate(resource, payload)) {
      return NextResponse.json({ error: "يرجى تعبئة الحقول الأساسية قبل الحفظ" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from(resources[resource].table)
      .insert([{ ...payload, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, item: data });
  } catch (err: any) {
    console.error("Admin content create error:", err);
    return NextResponse.json({ error: err.message || "تعذر إنشاء المحتوى" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const resource = getResource(body.resource);
    if (!resource || !body.id) {
      return NextResponse.json({ error: "القسم والمعرف مطلوبان" }, { status: 400 });
    }
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "Supabase غير مهيأ" }, { status: 503 });
    }

    const payload = normalize(resource, body);
    if (!validate(resource, payload)) {
      return NextResponse.json({ error: "يرجى تعبئة الحقول الأساسية قبل الحفظ" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from(resources[resource].table)
      .update(payload)
      .eq("id", body.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, item: data });
  } catch (err: any) {
    console.error("Admin content update error:", err);
    return NextResponse.json({ error: err.message || "تعذر تحديث المحتوى" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const resource = getResource(body.resource);
    if (!resource || !body.id) {
      return NextResponse.json({ error: "القسم والمعرف مطلوبان" }, { status: 400 });
    }
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "Supabase غير مهيأ" }, { status: 503 });
    }

    const { error } = await supabaseAdmin
      .from(resources[resource].table)
      .delete()
      .eq("id", body.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Admin content delete error:", err);
    return NextResponse.json({ error: err.message || "تعذر حذف المحتوى" }, { status: 500 });
  }
}
