import HomeClient from "@/components/home/HomeClient";
import { HOME_DOCTORS_PAGE_SIZE } from "@/lib/constants";
import { fetchPublicDoctors } from "@/lib/public-doctors";
import type { Doctor } from "@/lib/types";

// Regenerated at most once a minute so new clinics and ranking changes show up quickly.
export const revalidate = 60;

export default async function HomePage() {
  let initialDoctors: Doctor[] = [];

  try {
    const doctors = await fetchPublicDoctors();
    initialDoctors = doctors.slice(0, HOME_DOCTORS_PAGE_SIZE) as Doctor[];
  } catch (error) {
    // The client still loads the list from /api/doctors, so the page stays usable.
    console.error("Homepage doctors preload failed:", error);
  }

  return <HomeClient initialDoctors={initialDoctors} />;
}
