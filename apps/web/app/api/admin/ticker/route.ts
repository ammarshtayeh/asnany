import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    if (!isSupabaseConfigured) return NextResponse.json({ items: [] });

    const { data, error } = await supabaseAdmin
      .from("news_ticker_items")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ items: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "قاعدة البيانات غير متاحة" }, { status: 503 });
    }

    const body = await request.json();
    const payload = {
      title: String(body.title || "").trim(),
      subtitle: body.subtitle || "",
      image_url: body.image_url || "",
      link_url: body.link_url || "",
      background_color: body.background_color || "#0f172a",
      text_color: body.text_color || "#ffffff",
      sort_order: Number(body.sort_order || 0),
      is_active: body.is_active !== false,
      starts_at: body.starts_at || null,
      ends_at: body.ends_at || null,
      updated_at: new Date().toISOString(),
    };

    if (!payload.title) {
      return NextResponse.json({ error: "العنوان مطلوب" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.from("news_ticker_items").insert(payload).select("*").single();
    if (error) throw error;
    return NextResponse.json({ success: true, item: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "قاعدة البيانات غير متاحة" }, { status: 503 });
    }

    const body = await request.json();
    const id = String(body.id || "");
    if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("news_ticker_items")
      .update({
        title: body.title,
        subtitle: body.subtitle,
        image_url: body.image_url,
        link_url: body.link_url,
        background_color: body.background_color,
        text_color: body.text_color,
        sort_order: body.sort_order,
        is_active: body.is_active,
        starts_at: body.starts_at,
        ends_at: body.ends_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, item: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "قاعدة البيانات غير متاحة" }, { status: 503 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });

    const { error } = await supabaseAdmin.from("news_ticker_items").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
