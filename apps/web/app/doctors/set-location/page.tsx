import { redirect } from "next/navigation";

export default function SetDoctorLocationRedirect() {
  redirect("/doctor/login");
}
