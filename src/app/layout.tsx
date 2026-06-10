import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { DCProvider } from "@/store/dc-store";
import { UIProvider } from "@/store/ui-store";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resonara",
  description: "Simuladores interactivos de circuitos eléctricos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            const stored = localStorage.getItem('theme')
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            if (stored === 'dark' || (!stored && prefersDark)) {
              document.documentElement.classList.add('dark')
            }
          })()
        `,
          }}
        />
      </head>
      <body className="bg-white text-neutral-900 antialiased dark:bg-neutral-900 dark:text-neutral-100">
        <UIProvider>
          <DCProvider>{children}</DCProvider>
        </UIProvider>
        <Analytics />
      </body>
    </html>
  );
}
