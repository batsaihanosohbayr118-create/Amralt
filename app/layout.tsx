import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin", "cyrillic-ext"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("RootMetadata");
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
    ),
    title: {
      default: t("title"),
      template: "%s | Amralt.mn",
    },
    description: t("description"),
    themeColor: "#007145",
    appleWebApp: {
      title: "Amralt.mn",
      statusBarStyle: "black-translucent",
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider>
          <SessionProvider>
            {children}
            <Toaster richColors position="top-center" />
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
