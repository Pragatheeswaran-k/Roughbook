export interface Expense {
  id: string;
  user_id: string;
  date: string; // ISO date string
  category: string;
  amount: number;
  note?: string;
  created_at: string;
}

export interface ExpenseItem {
  id: string;
  amount: string; // stored as string for precision (e.g., from input)
  category: string;
  note?: string;
  date: string; // ISO string format
  type: "expense" | "income";
  datetime: string;
  time?: string; // optional: "HH:mm" or full timestamp
  payment_mode?: string; // e.g., "UPI", "Cash", "Credit"
  tags?: string; // comma-separated (e.g., "food,restaurant")
}

export interface TopCategoryResult {
  topCategory: string;
  total: number;
}

export interface PeakWeekResult {
  weekRange: string; // e.g., "7/27/2025 - 8/2/2025"
  label: string;     // e.g., "Peak Spend"
}
export type SmartAdviceResult = string;

