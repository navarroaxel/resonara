import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resonara — Lugares Geométricos",
  description:
    "Método gráfico de lugares geométricos para resonancia en circuito paralelo RLC.",
};

export default function LociLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
