import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { verifySessionToken } from "@/lib/session-token";

export async function getAdminSession(request?: Request) {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("admin_session")?.value;
  const bearerToken = request?.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const session = verifySessionToken(bearerToken, "admin") || verifySessionToken(cookieToken, "admin");
  const adminId = session?.sub;
  if (!adminId) return null;

  const { data, error } = await supabaseAdmin
    .from("admins")
    .select("id, email")
    .eq("id", adminId)
    .single();

  if (error || !data) return null;
  return data;
}
