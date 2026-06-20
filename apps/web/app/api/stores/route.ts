import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase, supabaseAdmin } from "@/lib/supabase";
import { rateLimitResponse, withRateLimit } from "@/lib/rate-limit";

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json([]);
    }

    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err: unknown) {
    console.error("GET /api/stores error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "تعذر جلب المتاجر" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const rate = withRateLimit(request, "stores-post", 6, 60_000);
    if (!rate.ok) return rateLimitResponse(rate.retryAfter);

    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "قاعدة البيانات غير مهيأة" }, { status: 503 });
    }

    const body = await request.json();
    const storeName = body.storeName || body.store_name;
    const city = body.city;
    const description = body.description || "";
    const phone = body.phone || "";
    const whatsapp = body.whatsapp || "";
    const website = body.website || "";
    const specialization = body.specialization || "تجهيزات ومواد طبية";
    const logoUrl =
      body.logoUrl ||
      body.logo_url ||
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop";

    if (!storeName || !city || !phone || !description) {
      return NextResponse.json({ error: "اسم المتجر والمدينة والهاتف والوصف مطلوبة" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("stores")
      .insert([
        {
          store_name: storeName,
          description,
          city,
          phone,
          whatsapp,
          website,
          logo_url: logoUrl,
          specialization,
          is_active: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, store: data });
  } catch (err: unknown) {
    console.error("POST /api/stores error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "تعذر إرسال الطلب" }, { status: 500 });
  }
}
