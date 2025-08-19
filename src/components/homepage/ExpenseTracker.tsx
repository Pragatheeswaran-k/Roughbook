import { useEffect, useState, useRef } from "react";
import { constants } from "../../common/constants";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useTopCategory } from "../../hooks/useTopCategory";
import { usePeakWeek } from "../../hooks/usePeakWeek";
import { useSmartAdvice } from "../../hooks/useSmartAdvice";
import { Trash2, PlusCircle } from "lucide-react";
import type { ExpenseItem } from "../../types/ExpenseType";
import SummaryCard from "../expenses/SummaryCards";
import { ExpenseForm } from "../expenses/ExpenseForm";
import { Alert } from "../../utills/Alert";
import { Dialog } from "@headlessui/react";

export default function ExpenseTracker() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const {categories} = constants
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ date: "", category: "", amount: "", note: "", type:"", paymentMode: "", tags: "" });
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const amountRef = useRef<HTMLInputElement>(null!);
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});
  const [openModal, setOpenModal] = useState(false);
  const [userProfile, setUserProfile] = useState<{ xp: number; level: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else {
          const transformed = (data || []).map((exp) => {
            const date = exp.datetime
              ? new Date(exp.datetime).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0];
          
            return {
              id: exp.id,
              user_id: exp.user_id,
              amount: exp.amount,
              category: exp.category,
              note: exp.note,
              datetime: exp.datetime ?? exp.date,
              date,
              type: exp.type ?? "expense",
              payment_mode: exp.payment_mode ?? "cash",
              created_at: exp.created_at,
            };
          }) as ExpenseItem[];          
          setExpenses(transformed);
        }
        setLoading(false);
      });
  }, [user, supabase]);

  useEffect(() => {
    if (!user) return;
  
    const fetchUserProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("xp, level")
        .eq("id", user.id)
        .single();
  
      if (!error && data) {
        setUserProfile({
          xp: data.xp,
          level: data.level,
        });
      }
    };
  
    fetchUserProfile();
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAdding(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});
  
    const { date, category, amount, note, type, paymentMode } = form;
  
    const errors: { [k: string]: string } = {};
    if (!date) errors.date = "Date is required.";
    if (!category) errors.category = "Category is required.";
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      errors.amount = "Valid amount is required.";
    if (!type) errors.type = "Type is required.";
    if (!paymentMode) errors.paymentMode = "Payment mode is required.";
  
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setAdding(false);
      if (errors.amount && amountRef.current) amountRef.current.focus();
      return;
    }
  
    const { data, error } = await supabase
      .from("expenses")
      .insert([
        {
          user_id: user.id,
          date,
          category,
          amount: parseFloat(amount),
          note,
          type,
          payment_mode: paymentMode,
        },
      ])
      .select();
  
    if (error) setError(error.message);
    else if (data) {
      const transformed = data.map((exp) => {
        const date = exp.datetime
          ? new Date(exp.datetime).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];
  
        return {
          id: exp.id,
          user_id: exp.user_id,
          amount: exp.amount,
          category: exp.category,
          note: exp.note,
          datetime: exp.datetime ?? exp.date,
          date,
          type: exp.type ?? "expense",
          payment_mode: exp.payment_mode ?? "cash",
          created_at: exp.created_at,
        };
      }) as ExpenseItem[];
      const gainedXP = 5; // or dynamic logic based on amount
      if (userProfile) {
        const updatedXP = (userProfile.xp ?? 0) + gainedXP;
        const newLevel = Math.floor(updatedXP / 100);
      
        await supabase
          .from("profiles")
          .update({ xp: updatedXP, level: newLevel })
          .eq("id", user.id);
      
        setUserProfile({
          xp: updatedXP,
          level: newLevel,
        });
      }
      setExpenses((prev) => [...transformed, ...prev]);
      setSuccess("Expense added!");
    }
  
    setAdding(false);
    setForm({
      date: "",
      type: "",
      category: "",
      amount: "",
      paymentMode: "",
      tags: "",
      note: "",
    });
    setOpenModal(false);
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    const { error } = await supabase.from("expenses").delete().eq("id", deleteId);
    if (error) setError(error.message);
    else {
      setExpenses((prev) => prev.filter((e) => e.id !== deleteId));
      setSuccess("Expense deleted.");
    }
    setLoading(false);
    setDeleteId(null);
  };

  const top = useTopCategory(expenses);
  const week = usePeakWeek(expenses);
  const advice = useSmartAdvice(expenses);
  const totalIncome = expenses
  .filter((e) => e.type === "income")
  .reduce((sum, e) => sum + Number(e.amount), 0);

const totalExpense = expenses
  .filter((e) => e.type === "expense")
  .reduce((sum, e) => sum + Number(e.amount), 0);

const balance = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-gray-50 flex pt-20">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 bg-white shadow-xl p-6">
        <div className="text-xl font-bold text-indigo-700 mb-8">📘 Roughbook</div>
        <nav className="space-y-4">
          <div className="text-indigo-600 font-semibold">📊 Expense Tracker</div>
          {/* Future: Add links for Reports, Trophies, Missions etc. */}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-700">💸 Expense Tracker</h1>
          <button
            onClick={() => setOpenModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            <PlusCircle className="w-5 h-5" /> Add Expense
          </button>
        </div>

        {/* XP Progress Card */}
        <div className="bg-white border border-indigo-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-indigo-700 font-semibold">🎮 Level {userProfile?.level ?? 1}</div>
            <div className="text-indigo-500 text-sm">{userProfile?.xp ?? 0} XP</div>
          </div>
          <div className="w-full bg-indigo-100 h-2 rounded-full mt-2">
            <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(userProfile?.xp ?? 0) % 100}%` }}></div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SummaryCard title="💰 Balance" value={`₹${balance.toLocaleString()}`} subtitle={`Income: ₹${totalIncome.toLocaleString()} | Expense: ₹${totalExpense.toLocaleString()}`} color="indigo" />
          <SummaryCard title="🏆 Top Category" value={top.topCategory} subtitle={`₹${top.total.toLocaleString()}`} color="yellow" />
          <SummaryCard title="📅 Peak Week" value={week?.weekRange || "-"} subtitle={week?.label ?? "-"} color="blue" />
        </div>

        {/* Smart Insight */}
        <div className="bg-gradient-to-r from-green-100 to-green-50 border-l-4 border-green-500 shadow px-6 py-4 rounded-2xl flex gap-4">
          <div className="text-3xl">💡</div>
          <div>
            <h4 className="text-lg font-semibold text-green-700">Smart Insight</h4>
            <p className="text-green-900 text-base">{advice}</p>
          </div>
        </div>

        {success && <Alert type="success" message={success} />}
        {error && <Alert type="error" message={error} />}

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-auto">
          <table className="w-full text-sm text-left min-w-max">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Note</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Amount (₹)</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => {
                const dateObj = new Date(exp.datetime);
                return (
                  <tr key={exp.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-800">{exp.category}</td>
                    <td className="px-6 py-3 text-gray-600">{exp.note || "-"}</td>
                    <td className="px-6 py-3 text-gray-500">{dateObj.toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-gray-500">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-6 py-3 text-gray-600">{exp.payment_mode}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${exp.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}>{exp.type}</span>
                    </td>
                    <td className="px-6 py-3 font-semibold text-indigo-600">₹{exp.amount.toLocaleString()}</td>
                    <td className="px-6 py-3 text-center">
                      <button onClick={() => handleDelete(exp.id)} className="text-red-500 hover:text-red-700" disabled={loading}>
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {expenses.length === 0 && !loading && (
            <div className="text-center text-gray-400 py-6">No expenses recorded.</div>
          )}
        </div>
</main>
      {/* Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Add Expense</h2>
            <ExpenseForm
              form={form}
              setForm={setForm}
              handleAdd={handleAdd}
              adding={adding}
              fieldErrors={fieldErrors}
              categories={categories}
              amountRef={amountRef}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setOpenModal(false)}
                className="text-sm text-gray-500 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-center text-red-800">Confirm Deletion</h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                disabled={loading}
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
