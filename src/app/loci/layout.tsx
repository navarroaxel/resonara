import type { Metadata } from "next";
import { T } from "@/lib/i18n";

export const metadata: Metadata = {
  title: T.es.lociMetaTitle,
  description: T.es.lociMetaDesc,
};

export default function LociLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
