import { useMemo } from "react";
import type { ExpenseItem } from "../types/ExpenseType";
import { startOfWeek, endOfWeek, format } from "date-fns";

export function usePeakWeek(expenses: ExpenseItem[]) {
  return useMemo(() => {
    const weekMap: Record<string, number> = {};

    expenses.forEach((exp) => {
      if (!exp.datetime) return;
      const date = new Date(exp.datetime);

      const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
      const key = weekStart.toISOString(); // keep full ISO

      weekMap[key] = (weekMap[key] || 0) + parseFloat(exp.amount);
    });

    const peakWeek = Object.entries(weekMap).sort((a, b) => b[1] - a[1])[0];
    if (!peakWeek) return null;

    const [start] = peakWeek;
    const startDate = new Date(start);
    const endDate = endOfWeek(startDate, { weekStartsOn: 1 });

    return {
      weekRange: `${format(startDate, "M/d/yyyy")} - ${format(endDate, "M/d/yyyy")}`,
      label: "Peak Spend",
    };
  }, [expenses]);
}
