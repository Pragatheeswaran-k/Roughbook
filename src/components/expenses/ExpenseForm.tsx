import React, { ForwardedRef } from "react";

export interface FormFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}
interface FormSelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  error?: string;
  disabled?: boolean;
}
interface ExpenseFormValues {
  date: string;
  type: string;
  category: string;
  amount: string;
  paymentMode: string;
  tags: string;
  note: string;
}

export const FormField = React.forwardRef(
  (
    {
      label,
      value,
      onChange,
      type,
      placeholder,
      error,
      disabled,
    }: FormFieldProps,
    ref: ForwardedRef<HTMLInputElement>
  ) => (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        ref={ref}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full rounded-lg border-2 px-3 py-2 mt-1 transition ${
          error ? "border-red-500 bg-red-50" : "border-gray-300"
        } focus:ring-2 focus:ring-indigo-400 focus:outline-none`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
);

FormField.displayName = "FormField"; // Required for forwardRef


type ExpenseFormProps = {
    form: ExpenseFormValues;
    setForm: React.Dispatch<React.SetStateAction<any>>;
    handleAdd: (e: React.FormEvent) => void;
    adding: boolean;
    fieldErrors: Record<string, string>;
    categories: string[];
    amountRef: React.RefObject<HTMLInputElement>;
  };
  
  export const ExpenseForm = ({
    form,
    setForm,
    handleAdd,
    adding,
    fieldErrors,
    categories,
    amountRef,
  }: ExpenseFormProps) => {
    const paymentModes = ["Cash", "UPI", "Credit Card", "Bank Transfer"];
    const types = ["expense", "income"];
  
    return (
      <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl shadow space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
  label="Date & Time"
  type="datetime-local"
  value={form.date}
  onChange={(v) => setForm((f: any) => ({ ...f, date: v }))}
  error={fieldErrors.date}
  disabled={adding}
/>
  
          <FormSelect
            label="Type"
            value={form.type}
            onChange={(v: string) => setForm((f) => ({ ...f, type: v }))}
            options={types}
            error={fieldErrors.type}
            disabled={adding}
          />
  
          <FormSelect
            label="Category"
            value={form.category}
            onChange={(v: string) => setForm((f) => ({ ...f, category: v }))}
            options={categories}
            error={fieldErrors.category}
            disabled={adding}
          />
  
          <FormField
            label="Amount (₹)"
            type="number"
            placeholder="Ex: 250"
            value={form.amount}
            onChange={(v) => setForm((f) => ({ ...f, amount: v }))}
            error={fieldErrors.amount}
            disabled={adding}
            ref={amountRef}
          />
  
          <FormSelect
            label="Payment Mode"
            value={form.paymentMode}
            onChange={(v: string) => setForm((f) => ({ ...f, paymentMode: v }))}
            options={paymentModes}
            error={fieldErrors.paymentMode}
            disabled={adding}
          />
  
          <FormField
            label="Tags (comma separated)"
            type="text"
            placeholder="Ex: food, weekend"
            value={form.tags}
            onChange={(v) => setForm((f) => ({ ...f, tags: v }))}
            error={fieldErrors.tags}
            disabled={adding}
          />
  
          <FormField
            label="Note (optional)"
            type="text"
            placeholder="Ex: Dinner with friends"
            value={form.note}
            onChange={(v) => setForm((f) => ({ ...f, note: v }))}
            disabled={adding}
          />
        </div>
  
        <div className="text-center">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            disabled={adding}
          >
            {adding ? "Adding..." : "➕ Add Entry"}
          </button>
        </div>
      </form>
    );
  };
  
  
  export const FormSelect = ({ label, value, onChange, options, error, disabled }: FormSelectProps) => (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <select
        className={`w-full rounded-lg border-2 px-3 py-2 mt-1 transition ${
          error ? "border-red-500 bg-red-50" : "border-gray-300"
        } focus:ring-2 focus:ring-indigo-400 focus:outline-none`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">Select</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );