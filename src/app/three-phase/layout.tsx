import type { Metadata } from "next";
import { ThreePhaseProvider } from "@/store/three-phase-store";

export const metadata: Metadata = {
  title: "Resonara — Trifásico RST",
  description:
    "Simulador interactivo de circuitos trifásicos en estrella y triángulo.",
};

export default function ThreePhaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThreePhaseProvider>{children}</ThreePhaseProvider>;
}
