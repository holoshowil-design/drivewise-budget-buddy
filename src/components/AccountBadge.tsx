import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { CloudCheck, CloudOff } from "lucide-react";
import { useAuthUser } from "@/hooks/use-auth";
import { saveLastAccount } from "@/lib/last-account";

/** Small always-visible chip showing which account is connected. */
export function AccountBadge() {
  const { user, loading } = useAuthUser();

  const meta = (user?.user_metadata ?? {}) as Record<string, string>;
  const name = meta.full_name || meta.name || "";
  const avatar = meta.avatar_url || meta.picture || "";
  const provider = (user?.app_metadata?.provider as string) || "email";
  const email = user?.email || "";

  useEffect(() => {
    if (email) saveLastAccount({ email, name, avatar, provider });
  }, [email, name, avatar, provider]);

  if (loading) return null;

  if (!user) {
    return (
      <Link
        to="/auth"
        className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground pressable"
      >
        <CloudOff className="h-3.5 w-3.5" />
        לא מחובר
      </Link>
    );
  }

  return (
    <Link
      to="/settings"
      className="inline-flex max-w-[9.5rem] items-center gap-2 rounded-full border bg-card px-2 py-1.5 pressable"
    >
      {avatar ? (
        <img src={avatar} alt={name || "תמונת פרופיל"} className="h-6 w-6 rounded-full object-cover" />
      ) : (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
          {(name || email || "?").slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className="min-w-0 leading-tight">
        <span dir="ltr" className="block truncate text-[11px] font-semibold">
          {email}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-primary">
          <CloudCheck className="h-3 w-3" />
          {provider === "google" ? "Google · מסונכרן" : "מסונכרן"}
        </span>
      </span>
    </Link>
  );
}
