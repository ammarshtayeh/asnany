import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ packages: [], subscriptions: [] });
    }

    const [packagesRes, subscriptionsRes] = await Promise.all([
      supabaseAdmin.from("subscription_packages").select("*").order("sort_order", { ascending: true }),
      supabaseAdmin
        .from("doctor_subscriptions")
        .select("*, subscription_packages(name, slug, price_usd, billing_period), doctors(name, city)")
        .order("created_at", { ascending: false }),
    ]);

    if (packagesRes.error) throw packagesRes.error;
    if (subscriptionsRes.error) throw subscriptionsRes.error;

    return NextResponse.json({
      packages: packagesRes.data || [],
      subscriptions: subscriptionsRes.data || [],
    });
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
      .from("doctor_subscriptions")
      .update({
        status: body.status,
        starts_at: body.starts_at,
        expires_at: body.expires_at,
        payment_reference: body.payment_reference,
        notes: body.notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*, subscription_packages(slug)")
      .single();

    if (error) throw error;

    if (body.status === "active" && data?.doctor_id) {
      const slug = (data as any)?.subscription_packages?.slug || null;
      const priority = slug === "featured-ads" ? 100 : slug === "premium" ? 60 : slug === "directory" ? 30 : 0;
      await supabaseAdmin
        .from("doctors")
        .update({
          active_package_slug: slug,
          package_expires_at: body.expires_at || data.expires_at || null,
          is_featured: slug === "premium" || slug === "featured-ads",
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.doctor_id);

      if (slug === "featured-ads") {
        await supabaseAdmin
          .from("advertisements")
          .update({ display_priority: priority, package_tier: slug })
          .eq("advertiser_name", data.advertiser_name || "");
      }
    }

    return NextResponse.json({ success: true, subscription: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
