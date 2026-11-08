import { cloneElement, useEffect, useRef, useState, type ReactElement } from "react";

type Size = { width: number; height: number };

/** Last measured size of each chart, so coming back to a tab draws the chart in its first render. */
const sizes = new Map<string, Size>();

/**
 * Stand-in for recharts' ResponsiveContainer that fills its parent. ResponsiveContainer measures
 * with getBoundingClientRect when it mounts, which forces a layout of the whole new page in the
 * middle of a tab switch, and then draws the chart only in a second render. This box takes the
 * size from a ResizeObserver (measured with the browser's own layout) and reuses the last size.
 */
export function ChartBox({
  id,
  children,
}: {
  id: string;
  children: ReactElement<{ width?: number; height?: number }>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size | null>(() => sizes.get(id) ?? null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      if (!width || !height) return;
      sizes.set(id, { width, height });
      setSize((prev) =>
        prev && prev.width === width && prev.height === height ? prev : { width, height },
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [id]);

  return (
    <div ref={ref} className="relative h-full w-full">
      {size && cloneElement(children, size)}
    </div>
  );
}
