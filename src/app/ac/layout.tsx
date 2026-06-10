import type { Metadata } from "next";
import { RLCProvider } from "@/store/rlc-store";

export const metadata: Metadata = {
  title: "Resonara — RLC CA",
  description: "Simulador interactivo de circuitos RLC en corriente alterna.",
};

export default function ACLayout({ children }: { children: React.ReactNode }) {
  return <RLCProvider>{children}</RLCProvider>;
}
