import { useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { X } from "lucide-react";
import clsx from "clsx";

interface CreateFolderProps {
  open: boolean;
  onClose: () => void;
  onFolderCreated?: () => void; // <-- Add this line
}

export default function CreateFolder({ open, onClose, onFolderCreated }: CreateFolderProps) {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!folderName.trim()) return setError("Folder name cannot be empty");
    setLoading(true);

    const { error } = await supabase.from("roughfolders").insert({
      name: folderName,
      user_id: user?.id,
    });

    if (error) {
      setError("Failed to create folder");
    } else {
      setFolderName("");
      setError(null);
      onClose();
      if (onFolderCreated) onFolderCreated();
    }

    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Folder</h2>

        <input
          type="text"
          placeholder="Enter folder name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
        />

        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className={clsx(
              "px-4 py-2 rounded-md text-sm text-white",
              loading ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"
            )}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
