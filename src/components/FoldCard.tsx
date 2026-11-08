import { ChevronDown, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/SectionTitle";

/**
 * A settings card folded to one line: badge, title and a short live summary ("600 ₪ ליום").
 * A tap opens it. Native <details>, so the fields stay mounted (typed values survive a
 * fold) and the page works without JavaScript animation.
 */
export function FoldCard({
  icon,
  title,
  hint,
  tone,
  defaultOpen = false,
  children,
}: {
  icon: LucideIcon;
  title: string;
  hint?: React.ReactNode;
  tone?: "default" | "danger";
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <details className="fold-card group" open={defaultOpen}>
        <summary className="flex cursor-pointer list-none items-center gap-2 p-4 [&::-webkit-details-marker]:hidden">
          <span className="min-w-0 flex-1">
            <SectionTitle icon={icon} tone={tone}>
              {title}
            </SectionTitle>
            {hint && (
              <span className="num mt-0.5 block truncate ps-[2.4rem] text-xs text-muted-foreground group-open:hidden">
                {hint}
              </span>
            )}
          </span>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="space-y-3 px-4 pb-4">{children}</div>
      </details>
    </Card>
  );
}
