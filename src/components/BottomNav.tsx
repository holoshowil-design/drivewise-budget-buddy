import { Link, useRouterState } from "@tanstack/react-router";
import { Home, PlusCircle, Calendar, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "דשבורד", icon: Home },
  { to: "/calendar", label: "לוח שנה", icon: Calendar },
  { to: "/add", label: "הוסף", icon: PlusCircle, highlight: true },
  { to: "/reports", label: "דוחות", icon: BarChart3 },
  { to: "/settings", label: "הגדרות", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <ul className="mx-auto flex max-w-xl items-stretch justify-around px-2">
        {items.map((it) => {
          const active = pathname === it.to;
          const Icon = it.icon;
          return (
            <li key={it.to} className="flex-1">
              <Link
                to={it.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-xs transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {it.highlight ? (
                  <span
                    className={cn(
                      "flex h-12 w-12 -mt-6 items-center justify-center rounded-full text-primary-foreground shadow-lg",
                    )}
                    style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                ) : (
                  <Icon className="h-5 w-5" />
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
