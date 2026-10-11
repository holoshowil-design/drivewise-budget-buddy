import { forwardRef, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { sanitizeNumberInput } from "@/lib/number";
import { cn } from "@/lib/utils";

type Props = Omit<ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
  /** Raw text as typed ("7,4" stays "7,4" until saved). */
  value: string;
  onValueChange: (text: string) => void;
  error?: string;
};

/**
 * Numeric input for every form: keeps the typed text (so "7." and "7,4" can be
 * typed), accepts a decimal comma or point, and shows a validation message
 * under the field. Convert with parseNumber() only when saving.
 */
export const NumberField = forwardRef<HTMLInputElement, Props>(function NumberField(
  { value, onValueChange, error, className, id, ...rest },
  ref,
) {
  const errorId = id ? `${id}-error` : undefined;
  return (
    <>
      <Input
        ref={ref}
        id={id}
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(e) => onValueChange(sanitizeNumberInput(e.target.value))}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
        {...rest}
      />
      {error && (
        <p id={errorId} className="text-[11px] font-medium text-destructive" role="alert">
          {error}
        </p>
      )}
    </>
  );
});
