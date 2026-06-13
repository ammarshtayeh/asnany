import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { verifySessionToken } from "@/lib/session-token";

export async function getDoctorSession(request?: Request) {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("doctor_session")?.value;
  const bearerToken = request?.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const session = verifySessionToken(bearerToken, "doctor") || verifySessionToken(cookieToken, "doctor");
  const accountId = session?.sub;
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
