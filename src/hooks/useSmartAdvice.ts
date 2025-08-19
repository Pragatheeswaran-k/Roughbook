import { useMemo } from "react";
import type { ExpenseItem } from "../types/ExpenseType";

export function useSmartAdvice(expenses: ExpenseItem[]) {
  return useMemo(() => {
    const foodTags = ["food", "dining", "restaurant", "swiggy", "zomato"];
    const foodExpenses = expenses.filter((exp) =>
      exp.tags?.split(",").some((tag) => foodTags.includes(tag.trim().toLowerCase()))
    );

    const total = foodExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    if (total > 1000) {
      return `Try cooking 3 nights – Save ₹${Math.round(total * 0.3)}!`;
    }

    return "Great job on controlled food spend!";
  }, [expenses]);
}
