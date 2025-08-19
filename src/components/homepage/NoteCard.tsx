import { motion } from "motion/react";
import { Trash2, Lock, Unlock, Pin, ArrowRight } from "lucide-react";
import clsx from "clsx";
import dayjs from "dayjs";

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  isPinned: boolean;
  isLocked?: boolean;
  isPrivate?: boolean;
}

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onClick: () => void;
  onTogglePin: (note: Note) => void;
  onToggleLock: (note: Note) => void;
  isSelected: boolean;
  onSelectToggle: (id: string) => void;
  onUnlockRequest: (note: Note) => void;
}

export default function NoteCard({
  note,
  onDelete,
  onClick,
  onTogglePin,
  onToggleLock,
  onUnlockRequest
}: NoteCardProps) {
  const handleCardClick = () => {
    if (!note.isLocked) onClick();
  };

  // Enhanced background with gradient
  const colorClass = [
    "bg-white/30 backdrop-blur-md border border-white/10 shadow-md",
    "bg-white/30 backdrop-blur-md border border-white/10 shadow-md",
    "bg-white/30 backdrop-blur-md border border-white/10 shadow-md",
    "bg-white/30 backdrop-blur-md border border-white/10 shadow-md"
  ][note.title.length % 4];

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className={clsx(
          "relative rounded-3xl p-7 transition cursor-pointer border border-gray-100 shadow-xl hover:shadow-2xl overflow-hidden",
          colorClass,
          note.isLocked && "opacity-70 pointer-events-none"
        )}
        onClick={handleCardClick}
        style={{
          minHeight: 320,
          maxWidth: 400,
          margin: "auto"
        }}
      >
        {/* Title and Date */}
        <div className="mb-6">
          <h3 className="text-2xl font-extrabold text-gray-900 mb-2 flex items-center gap-2 tracking-tight">
            {note.isPrivate && <Lock className="w-5 h-5 text-gray-400" />}
            <span className="truncate">{note.title || "Untitled Note"}</span>
          </h3>
          <p className="text-xs text-gray-400 font-mono">{dayjs(note.created_at).format("MMM D, YYYY")}</p>
        </div>

        {/* Tags */}
        {(note.tags?.length || 0) > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {(note?.tags || []).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-gradient-to-r from-white/80 to-gray-100 text-xs font-semibold text-gray-700 border border-gray-200 shadow-sm hover:scale-105 transition"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Content Preview */}
        <div className="relative mb-8 overflow-hidden rounded-2xl group">
          <p
            className={clsx(
              "text-base text-gray-700 leading-snug line-clamp-3 transition-all duration-300 ease-in-out font-medium",
              note.isLocked && "blur-md scale-[0.97] opacity-70 select-none pointer-events-none"
            )}
          >
            {note.content}
          </p>

          {note.isLocked && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl backdrop-blur-2xl bg-white/60 dark:bg-black/30 transition-all duration-300 group-hover:backdrop-blur-3xl group-hover:bg-white/70 shadow-inner">
              {/* Animated lock icon */}
              <Lock className="w-10 h-10 text-gray-500 dark:text-gray-300 animate-bounce mb-2" />

              {/* Shimmer line */}
              <div className="h-1 w-28 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer rounded-full mb-3" />

              {/* Lock Message */}
              <span
                className="text-base font-bold text-gray-700 dark:text-gray-200"
                title="This note is locked and cannot be viewed"
              >
                This note is locked
              </span>

              {/* Unlock Button */}
              <button
                className="mt-4 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 text-sm text-blue-700 font-semibold border border-blue-200 shadow hover:bg-blue-50 transition pointer-events-auto"
                onClick={(e) => { e.stopPropagation(); onUnlockRequest(note); }}
              >
                <Unlock className="inline w-4 h-4 mr-1" /> Unlock to View
              </button>
            </div>
          )}
        </div>

        {/* Actions and Explore - HIDE if note is locked */}
        {!note.isLocked && (
          <div className="flex justify-between items-end absolute bottom-6 left-7 right-7">
            <div className="flex gap-2">
              {/* Pin */}
              <button
                onClick={(e) => { e.stopPropagation(); onTogglePin(note); }}
                title={note.isPinned ? "Unpin" : "Pin"}
                className={clsx(
                  "w-9 h-9 flex items-center justify-center rounded-full border transition shadow-sm hover:scale-110",
                  note.isPinned
                    ? "bg-yellow-100 text-yellow-600 border-yellow-300 hover:bg-yellow-200"
                    : "bg-white text-gray-300 border-gray-200 hover:text-yellow-500 hover:bg-yellow-50"
                )}
              >
                <Pin className="w-5 h-5" strokeWidth={note.isPinned ? 2.5 : 1.5} fill={note.isPinned ? "#facc15" : "none"} />
              </button>
              {/* Lock */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (note.isLocked) {
                    onUnlockRequest(note);
                  } else {
                    onToggleLock(note);
                  }
                }}
                title={note.isLocked ? "Unlock" : "Lock"}
                className={clsx(
                  "w-9 h-9 flex items-center justify-center rounded-full border transition shadow-sm hover:scale-110",
                  note.isLocked
                    ? "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                    : "bg-white text-gray-300 border-gray-200 hover:text-gray-500 hover:bg-gray-50"
                )}
              >
                {note.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
              </button>
              {/* Delete */}
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                title="Delete"
                className="w-9 h-9 flex items-center justify-center rounded-full text-red-500 border border-gray-200 hover:bg-red-50 hover:text-red-600 shadow-sm hover:scale-110"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            {/* Explore Button */}
            <button
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-white/90 to-gray-100 text-gray-700 font-bold shadow border border-gray-200 hover:bg-gray-50 transition hover:scale-105"
              onClick={(e) => { e.stopPropagation(); onClick(); }}
            >
              Explore <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}
