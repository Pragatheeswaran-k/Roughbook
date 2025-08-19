import { useMemo } from "react";
import type { ExpenseItem } from "../types/ExpenseType";

export function useTopCategory(expenses: ExpenseItem[]) {
  return useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    for (const exp of expenses) {
      if (exp.type === "expense") {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + parseFloat(exp.amount);
      }
    }
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const [topCategory, total] = sorted[0] || ["-", 0];
    return { topCategory, total };
  }, [expenses]);
}
