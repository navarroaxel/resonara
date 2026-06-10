import type { ReactNode } from "react";
import { SimulatorNav } from "@/components/ui/SimulatorNav";
import { GitHubLink } from "@/components/ui/GitHubLink";
import { SettingsPanel } from "@/components/ui/SettingsPanel";

export function SimulatorHeader({ children }: { children: ReactNode }) {
  return (
    <header className="flex flex-col gap-2 border-b border-neutral-200 px-6 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Resonara</h1>
        {children}
      </div>
      <div className="flex items-center gap-2">
        <SimulatorNav />
        <GitHubLink />
        <SettingsPanel />
      </div>
    </header>
  );
}
