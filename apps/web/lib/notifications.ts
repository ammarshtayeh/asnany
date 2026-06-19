import { supabaseAdmin } from "@/lib/supabase";
import { sendWebPushNotification } from "@/lib/web-push";

type AppointmentNotification = {
  id: string;
  doctor_id?: string | null;
  patient_full_name?: string | null;
  patient_name?: string | null;
  patient_phone?: string | null;
  date?: string | null;
  time?: string | null;
  status?: string | null;
};

type ExpoPushSubscription = {
  expo_push_token: string | null;
};

type WebPushSubscription = {
  web_endpoint: string;
  web_p256dh: string;
  web_auth: string;
};

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const APPOINTMENTS_CHANNEL_ID = "appointments";

function normalizePhone(phone?: string | null) {
  return (phone || "").replace(/[^0-9]/g, "");
}

function isExpoPushToken(token: string) {
  return /^Expo(nent)?PushToken\[[^\]]+\]$/.test(token);
}

async function insertNotification({
  recipientRole,
  doctorId,
  patientPhone,
  appointmentId,
  title,
  body,
  data,
}: {
  recipientRole: "patient" | "doctor" | "admin";
  doctorId?: string | null;
  patientPhone?: string | null;
  appointmentId?: string | null;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) {
  await supabaseAdmin.from("notifications").insert({
    recipient_role: recipientRole,
    doctor_id: doctorId || null,
    patient_phone: patientPhone ? normalizePhone(patientPhone) : null,
    appointment_id: appointmentId || null,
    title,
    body,
    data: data || {},
  });
}

async function sendExpoPush(tokens: string[], title: string, body: string, data: Record<string, unknown>) {
  const validTokens = Array.from(new Set(tokens.filter(isExpoPushToken)));
  if (!validTokens.length) return;

  const messages = validTokens.map((to) => ({
    to,
    sound: "default",
    channelId: APPOINTMENTS_CHANNEL_ID,
    priority: "high",
    ttl: 60 * 60 * 24,
    badge: 1,
    interruptionLevel: "active",
    title,
    body,
    data,
  }));

  const response = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messages),
  });

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    console.error("Expo push send error:", result || response.statusText);
    return;
  }

  const tickets = Array.isArray(result?.data) ? result.data : [];
  const invalidTokens = tickets
    .map((ticket: any, index: number) => (ticket?.details?.error === "DeviceNotRegistered" ? validTokens[index] : null))
    .filter(Boolean);

  if (invalidTokens.length) {
    await supabaseAdmin.from("push_subscriptions").update({ is_active: false }).in("expo_push_token", invalidTokens);
  }
}

async function notifyByDoctor(doctorId: string, title: string, body: string, data: Record<string, unknown>) {
  const { data: subscriptions, error } = await supabaseAdmin
    .from("push_subscriptions")
    .select("expo_push_token")
    .eq("role", "doctor")
    .eq("doctor_id", doctorId)
    .eq("is_active", true);

  if (error) throw error;
  await sendExpoPush(
    (subscriptions as ExpoPushSubscription[] | null)?.map((item) => item.expo_push_token).filter(Boolean) as string[] || [],
    title,
    body,
    data
  );
}

async function notifyByPatientPhone(patientPhone: string, title: string, body: string, data: Record<string, unknown>) {
  const normalizedPhone = normalizePhone(patientPhone);
  if (!normalizedPhone) return;

  const { data: subscriptions, error } = await supabaseAdmin
    .from("push_subscriptions")
    .select("expo_push_token, web_endpoint, web_p256dh, web_auth")
    .eq("role", "patient")
    .eq("patient_phone", normalizedPhone)
    .eq("is_active", true);

  if (error) throw error;

  const rows = (subscriptions || []) as Array<ExpoPushSubscription & Partial<WebPushSubscription>>;
  const expoTokens = rows.map((item) => item.expo_push_token).filter(Boolean) as string[];
  await sendExpoPush(expoTokens, title, body, data);

  const staleWebEndpoints: string[] = [];
  for (const row of rows) {
    if (!row.web_endpoint || !row.web_p256dh || !row.web_auth) continue;
    const sent = await sendWebPushNotification(
      {
        endpoint: row.web_endpoint,
        keys: { p256dh: row.web_p256dh, auth: row.web_auth },
      },
      {
        title,
        body,
        url: "/appointments",
        data,
      }
    );
    if (!sent) staleWebEndpoints.push(row.web_endpoint);
  }

  if (staleWebEndpoints.length) {
    await supabaseAdmin
      .from("push_subscriptions")
      .update({ is_active: false })
      .in("web_endpoint", staleWebEndpoints);
  }
}

async function notifyAdmins(title: string, body: string, data: Record<string, unknown>) {
  const { data: subscriptions, error } = await supabaseAdmin
    .from("push_subscriptions")
    .select("expo_push_token")
    .eq("role", "admin")
    .eq("is_active", true);

  if (error) throw error;
  await sendExpoPush(
    (subscriptions as ExpoPushSubscription[] | null)?.map((item) => item.expo_push_token).filter(Boolean) as string[] || [],
    title,
    body,
    data
  );
}

export async function notifyDoctorAboutAppointment(appointment: AppointmentNotification) {
  try {
    if (!appointment.doctor_id) return;
    const patientName = appointment.patient_full_name || appointment.patient_name || "Patient";
    const title = "طلب حجز جديد";
    const body = `${patientName} طلب موعداً${appointment.date ? ` بتاريخ ${appointment.date}` : ""}.`;
    const data = {
      type: "appointment_created",
      appointmentId: appointment.id,
      doctorId: appointment.doctor_id,
      patientPhone: appointment.patient_phone ? normalizePhone(appointment.patient_phone) : null,
    };

    await insertNotification({
      recipientRole: "doctor",
      doctorId: appointment.doctor_id,
      appointmentId: appointment.id,
      title,
      body,
      data,
    });
    await notifyByDoctor(appointment.doctor_id, title, body, data);

    const adminData = { ...data, type: "admin_appointment_created" };
    await insertNotification({
      recipientRole: "admin",
      doctorId: appointment.doctor_id,
      appointmentId: appointment.id,
      title,
      body,
      data: adminData,
    });
    await notifyAdmins(title, body, adminData);
  } catch (error) {
    console.error("Appointment notification error:", error);
  }
}

export async function notifyPatientAboutAppointmentStatus(appointment: AppointmentNotification) {
  try {
    if (!appointment.patient_phone) return;
    const status = appointment.status || "updated";
    const title = "تحديث على موعدك";
    const body = `تم تحديث حالة موعدك إلى: ${status === "confirmed" ? "مؤكد" : status === "cancelled" ? "ملغي" : status === "completed" ? "مكتمل" : status}.`;
    const data = {
      type: "appointment_status",
      appointmentId: appointment.id,
      status,
      doctorId: appointment.doctor_id || null,
      patientPhone: normalizePhone(appointment.patient_phone),
    };

    await insertNotification({
      recipientRole: "patient",
      doctorId: appointment.doctor_id,
      patientPhone: appointment.patient_phone,
      appointmentId: appointment.id,
      title,
      body,
      data,
    });
    await notifyByPatientPhone(appointment.patient_phone, title, body, data);
  } catch (error) {
    console.error("Patient notification error:", error);
  }
}

export function normalizePushPhone(phone?: string | null) {
  return normalizePhone(phone);
}
