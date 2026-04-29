import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: "left" | "right" | "center";
  render?: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  className,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-border bg-card",
        className,
      )}
    >
      <table className="w-full text-sm" data-ocid="table">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  "px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide whitespace-nowrap",
                  col.align === "right"
                    ? "text-right"
                    : col.align === "center"
                      ? "text-center"
                      : "text-left",
                  col.width,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={rowKey(row, index)}
              className={cn(
                "border-b border-border/50 transition-smooth last:border-0",
                onRowClick && "cursor-pointer hover:bg-muted/50",
              )}
              onClick={() => onRowClick?.(row)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && onRowClick?.(row)
              }
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? "button" : undefined}
              data-ocid={`table.row.${index + 1}`}
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={cn(
                    "px-4 py-3 text-foreground",
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                        ? "text-center"
                        : "text-left",
                  )}
                >
                  {col.render
                    ? col.render(row, index)
                    : String(
                        (row as Record<string, unknown>)[String(col.key)] ?? "",
                      )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
