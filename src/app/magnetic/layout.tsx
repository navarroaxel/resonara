import type { Metadata } from "next";
import { MagneticProvider } from "@/store/magnetic-store";

export const metadata: Metadata = {
  title: "Resonara — Acoplamiento Magnético",
  description:
    "Simulador interactivo de transformadores y circuitos de acoplamiento magnético.",
};

export default function MagneticLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MagneticProvider>{children}</MagneticProvider>;
}
