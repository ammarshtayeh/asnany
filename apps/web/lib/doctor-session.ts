import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

export async function getDoctorSession(request?: Request) {
  const cookieStore = await cookies();
  const cookieAccountId = cookieStore.get("doctor_session")?.value;
  const bearerAccountId = request?.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const accountId = bearerAccountId || cookieAccountId;
  if (!accountId) return null;

  const { data, error } = await supabaseAdmin
    .from("doctor_accounts")
    .select("id, doctor_id, email, is_active, doctors(*)")
    .eq("id", accountId)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data;
}
