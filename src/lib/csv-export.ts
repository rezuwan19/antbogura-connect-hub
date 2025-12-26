import { format } from "date-fns";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: { key: keyof T; label: string }[]
) => {
  if (data.length === 0) return;

  // Create header row
  const header = columns.map((col) => `"${col.label}"`).join(",");

  // Create data rows
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value = item[col.key];
        if (value === null || value === undefined) return '""';
        if (typeof value === "string") {
          return `"${value.replace(/"/g, '""')}"`;
        }
        if (typeof value === "object" && value !== null && "getTime" in value) {
          return `"${format(value as Date, "PPpp")}"`;
        }
        return `"${String(value)}"`;
      })
      .join(",")
  );

  const csvContent = [header, ...rows].join("\n");
  
  // Create and trigger download
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
