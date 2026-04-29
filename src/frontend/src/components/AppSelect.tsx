import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { forwardRef } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface AppSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}

export const AppSelect = forwardRef<HTMLSelectElement, AppSelectProps>(
  ({ label, options, error, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full appearance-none px-3 py-2 pr-9 bg-card border rounded-lg text-sm text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-smooth cursor-pointer",
              error ? "border-destructive" : "border-border",
              className,
            )}
            data-ocid="select"
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
        {error && (
          <p className="text-xs text-destructive" data-ocid="field_error">
            {error}
          </p>
        )}
      </div>
    );
  },
);

AppSelect.displayName = "AppSelect";
