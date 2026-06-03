import { redirect } from "next/navigation";

// Public doctor self-registration has been moved to the Admin Dashboard.
// Doctors wishing to join the platform should contact the admin via WhatsApp.
export default function DoctorRegisterRedirect() {
  redirect("/join");
}
