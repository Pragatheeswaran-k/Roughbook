// Folder.tsx
import { FolderOpen, MoreVertical } from "lucide-react";

export default function Folder({ name, noteCount }: { name: string; noteCount: number }) {
  return (
    <div className="group relative p-4 rounded-xl border border-gray-300 bg-white shadow hover:shadow-md transition cursor-pointer">
      <div className="flex items-center gap-2">
        <FolderOpen className="text-blue-500 w-5 h-5" />
        <h4 className="font-semibold text-gray-800">{name}</h4>
      </div>
      <p className="text-sm text-gray-500">{noteCount} notes</p>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
        <MoreVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
      </div>
    </div>
  );
}
