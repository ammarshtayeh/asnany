import { isSupabaseConfigured, supabase, supabaseAdmin } from "@/lib/supabase";

export type PrelaunchSettings = {
  enabled: boolean;
  title: string;
  message: string;
  updatedAt: string | null;
};

export const DEFAULT_PRELAUNCH: PrelaunchSettings = {
  enabled: false,
  title: "قريباً",
  message: "ترقّبوا إطلاق ملامح في فلسطين",
  updatedAt: null,
};

function mapRow(row: any | null | undefined): PrelaunchSettings {
  if (!row) return { ...DEFAULT_PRELAUNCH };
  return {
    enabled: Boolean(row.prelaunch_enabled),
    title: String(row.prelaunch_title || DEFAULT_PRELAUNCH.title).trim() || DEFAULT_PRELAUNCH.title,
    message: String(row.prelaunch_message || DEFAULT_PRELAUNCH.message).trim() || DEFAULT_PRELAUNCH.message,
    updatedAt: row.updated_at || null,
  };
}

/** Public read — anon client is enough (RLS allows SELECT). */
export async function getPrelaunchSettings(): Promise<PrelaunchSettings> {
  if (!isSupabaseConfigured) return { ...DEFAULT_PRELAUNCH };
  try {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", "main").maybeSingle();
    if (error) throw error;
    return mapRow(data);
  } catch (error) {
    console.error("getPrelaunchSettings error:", error);
    return { ...DEFAULT_PRELAUNCH };
  }
}

export async function updatePrelaunchSettings(input: {
  enabled: boolean;
  title: string;
  message: string;
}): Promise<PrelaunchSettings> {
  if (!isSupabaseConfigured) {
    throw new Error("قاعدة البيانات غير متاحة");
  }

  const title = String(input.title || "").trim().slice(0, 80) || DEFAULT_PRELAUNCH.title;
  const message = String(input.message || "").trim().slice(0, 280) || DEFAULT_PRELAUNCH.message;

  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .upsert(
      {
        id: "main",
        prelaunch_enabled: Boolean(input.enabled),
        prelaunch_title: title,
        prelaunch_message: message,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data);
}
