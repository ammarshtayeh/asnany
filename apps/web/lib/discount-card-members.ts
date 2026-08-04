export type DiscountCardStatus = "pending" | "active" | "inactive" | "rejected" | "expired";

export type DiscountCardMember = {
  id: string;
  full_name: string;
  phone: string;
  city?: string | null;
  status: DiscountCardStatus;
  notes?: string | null;
  expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export function normalizePhone(value?: string | null) {
  return String(value || "").replace(/[^0-9]/g, "");
}

export function normalizeName(value?: string | null) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizeDiscountCardMember(body: any) {
  return {
    full_name: String(body.full_name || body.name || "").trim().replace(/\s+/g, " "),
    phone: normalizePhone(body.phone),
    city: String(body.city || "").trim(),
    status: (body.status || "pending") as DiscountCardStatus,
    notes: String(body.notes || "").trim(),
    expires_at: body.expires_at || null,
    updated_at: new Date().toISOString(),
  };
}

export function isActiveDiscountMember(member: DiscountCardMember) {
  if (member.status !== "active") return false;
  if (!member.expires_at) return true;
  return new Date(member.expires_at).getTime() >= Date.now();
}

export function attachDiscountCardStatus<T extends Record<string, any>>(appointments: T[], members: DiscountCardMember[]) {
  const activeMembers = members.filter(isActiveDiscountMember);
  return appointments.map((appointment) => {
    const appointmentPhone = normalizePhone(appointment.patient_phone);
    const member = activeMembers.find((item) => {
      // Phone-only match — never name-only (shared Arabic names caused false discounts)
      return Boolean(appointmentPhone) && normalizePhone(item.phone) === appointmentPhone;
    });

    return {
      ...appointment,
      discount_card_status: member ? "active" : "none",
      discount_card_member: member || null,
    };
  });
}

export function isMissingDiscountMemberTable(error: any) {
  return error?.code === "42P01" || String(error?.message || "").includes("discount_card_members");
}
