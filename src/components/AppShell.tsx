import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, CalendarDays, User } from "lucide-react";
import type { ReactNode } from "react";

const TABS = [
  { to: "/", label: "Découvrir", icon: Compass },
  { to: "/reservations", label: "Réservations", icon: CalendarDays },
  { to: "/profil", label: "Profil", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-background">
      <main className="flex-1 pb-24">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-md justify-around border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] pt-3 backdrop-blur">
        {TABS.map((tab) => {
          const active = tab.to === "/" ? pathname === "/" : pathname.startsWith(tab.to);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex flex-1 flex-col items-center gap-1 pb-3 text-[11px] tracking-wide transition-colors ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-5" strokeWidth={active ? 2 : 1.5} />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
