"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/layout/footer";

const AUTH_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

type Props = {
  header: React.ReactNode;
  compareBar: React.ReactNode;
  mobileNav: React.ReactNode;
  children: React.ReactNode;
};

export function SiteChrome({
  header,
  compareBar,
  mobileNav,
  children,
}: Props) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.has(pathname);

  if (isAuthPage) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      {header}
      <main className="flex-1">{children}</main>
      <Footer />
      {compareBar}
      {mobileNav}
    </>
  );
}
