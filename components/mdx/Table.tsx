export interface TableRow {
  name: string;
  description: string;
}

export function Table({
  title,
  rows,
}: {
  title?: string;
  rows: TableRow[];
}) {
  return (
    <div className="my-6 w-full">
      {title ? (
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 pb-2">
          {title}
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-lg border border-border/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/50">
              <th className="px-4 py-2.5 text-left font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground w-[40%] sm:w-[35%]">
                Operation
              </th>
              <th className="px-4 py-2.5 text-left font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Purpose
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.name}
                className="border-b border-border/40 last:border-b-0 transition-colors hover:bg-muted/40"
              >
                <td className="px-4 py-2.5 align-top">
                  <code className="font-mono text-xs font-medium text-foreground bg-muted px-1.5 py-0.5 rounded whitespace-nowrap">
                    {row.name}
                  </code>
                </td>
                <td className="px-4 py-2.5 align-top text-xs leading-relaxed text-muted-foreground">
                  {row.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
