import { useState } from "react";
import { Lock } from "lucide-react";

export default function UnlockModal({
  isOpen,
  onClose,
  onSubmit,
  noteTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  noteTitle: string;
}) {
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
        <div className="flex flex-col items-center">
          <Lock className="w-8 h-8 text-gray-500 mb-3" />
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Unlock Note</h2>
          <p className="text-sm text-gray-500 mb-4 text-center">Enter the password to view <strong>{noteTitle}</strong></p>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <div className="flex justify-between w-full">
            <button
              onClick={onClose}
              className="text-sm px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSubmit(password);
                setPassword("");
              }}
              className="text-sm px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Unlock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
