import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Plus, Calendar, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof Home; highlight?: boolean };
const items: NavItem[] = [
  { to: "/", label: "דשבורד", icon: Home },
  { to: "/calendar", label: "לוח שנה", icon: Calendar },
  { to: "/add", label: "הוסף", icon: Plus, highlight: true },
  { to: "/reports", label: "דוחות", icon: BarChart3 },
  { to: "/settings", label: "הגדרות", icon: Settings },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom,0px)]">
      <ul className="mx-auto flex max-w-xl items-stretch justify-around px-2">
        {items.map((it) => {
          const active = pathname === it.to;
          const Icon = it.icon;
          return (
            <li key={it.to} className="flex-1">
              <Link
                to={it.to as never}
                aria-label={it.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {it.highlight ? (
                  <span
                    className="-mt-6 flex h-13 w-13 items-center justify-center rounded-full text-primary-foreground transition-transform active:scale-95"
                    style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)", height: "3.25rem", width: "3.25rem" }}
                  >
                    <Icon className="h-6 w-6" strokeWidth={2.5} />
                  </span>
                ) : (
                  <span className="relative flex flex-col items-center">
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.9} />
                    <span
                      className={cn(
                        "absolute -top-2.5 h-1 w-1 rounded-full bg-primary transition-opacity",
                        active ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </span>
                )}
                <span className={cn(it.highlight && "sr-only")}>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
