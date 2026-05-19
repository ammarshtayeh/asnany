import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";

const bucket = "asnany-media";
const maxFileSize = 6 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "Supabase غير مهيأ" }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") || "admin").replace(/[^a-zA-Z0-9-_]/g, "");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "الملف مطلوب" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "يسمح برفع الصور فقط" }, { status: 400 });
    }

    if (file.size > maxFileSize) {
      return NextResponse.json({ error: "حجم الصورة يجب أن يكون أقل من 6MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const buffer = await file.arrayBuffer();

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    return NextResponse.json({ success: true, url: data.publicUrl, path });
  } catch (err: any) {
    console.error("Admin upload error:", err);
    return NextResponse.json({ error: err.message || "تعذر رفع الصورة" }, { status: 500 });
  }
}
