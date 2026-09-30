import type { Column } from "@/lib/admin/tables";
import { cellText } from "@/lib/admin/tables";

const cat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Harare",
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Plain-text rendering of one cell. Everything is rendered as text by React, never as HTML. */
function display(value: unknown): string {
  if (value instanceof Date) return `${cat.format(value)} CAT`;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  return cellText(value);
}

export function DataTable({ columns, rows }: { columns: Column[]; rows: Record<string, unknown>[] }) {
  if (rows.length === 0) {
    return <p className="rounded-xl bg-white p-6 text-muted shadow-sm">No records.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-sm">
      <table className="w-full min-w-max border-collapse text-left text-sm">
        <thead className="bg-navy text-white">
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className="whitespace-nowrap px-3 py-2 font-bold">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={String(row.id ?? row.key ?? i)} className="border-t border-line align-top odd:bg-white even:bg-mist/60">
              {columns.map((c) => {
                const text = display(row[c.key]);
                return (
                  <td key={c.key} className="px-3 py-2">
                    {c.long && text.length > 60 ? (
                      <details className="max-w-md">
                        <summary className="cursor-pointer text-navy">{text.slice(0, 60)}…</summary>
                        <p className="mt-1 whitespace-pre-wrap break-words">{text}</p>
                      </details>
                    ) : (
                      <span className={c.key === "id" ? "font-mono text-xs text-muted" : "whitespace-nowrap"}>{text}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
