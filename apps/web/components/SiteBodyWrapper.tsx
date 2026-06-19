"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function isPortalRoute(pathname: string) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/doctor" ||
    pathname.startsWith("/doctor/")
  );
}

export default function SiteBodyWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const portal = isPortalRoute(pathname);

  useEffect(() => {
    if (portal) {
      document.documentElement.style.setProperty("--navbar-height", "0px");
      document.documentElement.style.setProperty("--ticker-height", "0px");
    }
  }, [portal]);

  return (
    <div
      style={
        portal
          ? undefined
          : { paddingTop: "calc(var(--navbar-height, 72px) + var(--ticker-height, 0px))" }
      }
      className="flex min-h-screen flex-1 flex-col"
    >
      {children}
    </div>
  );
}
