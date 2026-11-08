import type { LucideIcon } from "lucide-react";

/**
 * A card heading with a small inked badge, so long pages (settings) can be scanned by
 * shape before reading. The badge matches the coach bubble's mustard ink circle.
 */
export function SectionTitle({
  icon: Icon,
  children,
  tone = "default",
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <h3 className={`section-title font-semibold ${tone === "danger" ? "text-destructive" : ""}`}>
      <span className="section-title-icon" data-tone={tone} aria-hidden="true">
        <Icon />
      </span>
      {children}
    </h3>
  );
}
