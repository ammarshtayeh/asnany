import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { store_name, description, city, phone, whatsapp, website, logo_url, specialization } = body;

    if (!store_name || !city) {
      return NextResponse.json({ error: "اسم المتجر والمدينة مطلوبان" }, { status: 400 });
    }

    const newStore = {
      store_name,
      description: description || "",
      city,
      phone: phone || "",
      whatsapp: whatsapp || "",
      website: website || "",
      logo_url: logo_url || "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop", // default logo
      specialization: specialization || "تجهيزات ومواد طبية",
      is_active: true
    };

    const { data, error } = await supabase
      .from("stores")
      .insert([newStore])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, store: data });
  } catch (err: any) {
    console.error("Add Store Error:", err);
    return NextResponse.json({ error: err.message || "حدث خطأ أثناء إضافة المتجر" }, { status: 500 });
  }
}
