// RoughNote.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { generateTitle } from "../utills/generateTitle";
import { Switch } from "@headlessui/react";
import { ClipboardIcon, DocumentTextIcon, CodeBracketIcon, TrashIcon, ArrowLeftIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

/**
 * RoughNote page component.
 * 
 * This component provides an interface for creating, editing, and viewing code/text notes.
 * It supports code and text modes, auto-generates titles for code, allows tagging, and integrates with Supabase for persistence.
 * 
 * Features:
 * - Fetches note data by ID from Supabase.
 * - Allows toggling between code and text modes.
 * - Auto-generates a title for code notes unless manually edited.
 * - Supports adding/removing tags.
 * - Handles saving/updating notes, including locked note protection.
 * - Provides UI for editing, clearing, and copying note content.
 * 
 * @component
 * @returns {JSX.Element} The rendered RoughNote page.
 */
export default function RoughNote() {
  const { id } = useParams();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isEdit = searchParams.has("isedit");
  const [isCodeMode, setIsCodeMode] = useState(true);
  const [code, setCode] = useState("// Start writing your code here...");
  const [text, setText] = useState("Start documenting your thoughts...");
  const [title, setTitle] = useState("Untitled Snippet");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTitleManuallyEdited, setIsTitleManuallyEdited] = useState(false);
  const [enabled, setEnabled] = useState(isCodeMode);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  /**
   * Fetches the note data from Supabase by ID and populates state.
   * Sets loading and error states accordingly.
   */
  useEffect(() => {
    // Only fetch if id is present and not "new"
    if (!id || !isEdit) {
      setLoading(false);
      return;
    }
    const fetchNote = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("roughnotes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("Note not found or error fetching note.");
        setLoading(false);
        return;
      }
      if (data) {
        setTitle(data.title || "Untitled Snippet");
        if (data.mode === "code") {
          setCode(data.content);
          setIsCodeMode(true);
        } else {
          setText(data.content);
          setIsCodeMode(false);
        }
      }
      setLoading(false);
    };

    fetchNote();
  }, [id, supabase]);

  /**
   * Handles saving or updating the note in Supabase.
   * Checks for locked notes before updating.
   * Updates the saved state for notification.
   * Logs errors to the console.
   * 
   * @async
   * @returns {Promise<void>}
   */
  const handleSave = async () => {
    const user = await supabase.auth.getUser();
    const noteData = {
      user_id: user.data.user?.id,
      title,
      tags,
      content: isCodeMode ? code : text,
      mode: isCodeMode ? "code" : "text",
    };

    let error;
    if (isEdit && id) {
      // Update existing note
      ({ error } = await supabase
        .from("roughnotes")
        .update(noteData)
        .eq("id", id));
    } else {
      // Insert new note
      ({ error } = await supabase.from("roughnotes").insert([noteData]));
    }

    if (isEdit && id) {
        const { data } = await supabase
          .from("roughnotes")
          .select("isLocked")
          .eq("id", id)
          .single();
      
        if (data?.isLocked) {
          alert("🔒 This note is locked and cannot be edited.");
          return;
        }
      
        ({ error } = await supabase
          .from("roughnotes")
          .update(noteData)
          .eq("id", id));
      }

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } else {
      console.error("Failed to save:", error.message);
    }
  };

  /**
   * Auto-generates a title for code notes if the title has not been manually edited.
   * Runs whenever code or mode changes.
   */
  useEffect(() => {
    if (isCodeMode && !isTitleManuallyEdited) {
      const autoTitle = generateTitle(code);
      setTitle(autoTitle);
    }
  }, [code, isCodeMode]);

  /**
   * Syncs the code/text mode with the enabled state (from the UI switch).
   */
  useEffect(() => {
    setIsCodeMode(enabled);
  }, [enabled]);

  /**
   * Handles adding a tag when Enter is pressed in the tag input.
   * Prevents duplicates and clears the input.
   * 
   * @param {React.KeyboardEvent<HTMLInputElement>} e - The keyboard event.
   */
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  /**
   * Removes a tag from the tags array.
   * 
   * @param {string} removeTag - The tag to remove.
   */
  const handleRemoveTag = (removeTag: string) => {
    setTags(tags.filter((tag) => tag !== removeTag));
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading note...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center px-4">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Back To Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br pt-20 from-indigo-50 via-slate-100 to-slate-200 text-black">
      <main className="pb-8 px-2 pt-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Card */}
          <div className="bg-white/95 rounded-2xl shadow-2xl border border-slate-200 p-6 flex flex-col gap-6">
          <div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-100 transition group focus:outline-none focus:ring-2 focus:ring-indigo-400"
            title="Back to Index"
          >
            <ArrowLeftIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-700" />
            <span className="text-indigo-700 font-medium group-hover:underline">Back</span>
          </button>
          </div>
            {/* Title Input */}
            <div className="relative flex items-center">
              <DocumentTextIcon className="h-5 w-5 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setIsTitleManuallyEdited(true);
                }}
                className="pl-10 text-2xl font-bold px-3 py-2 border border-indigo-100 shadow-inner rounded-lg w-full text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                placeholder="Enter a title..."
                aria-label="Note title"
              />
              {!isTitleManuallyEdited && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-600 rounded-full">Auto</span>
              )}
            </div>

            {/* Tags Input and Chips */}
            <div className="mt-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="px-3 py-2 border border-indigo-100 shadow-inner rounded-lg w-full text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                placeholder="Add a tag and press Enter"
                aria-label="Add tag"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-indigo-500 hover:text-red-500 focus:outline-none"
                      title="Remove tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Sticky Action Bar */}
            <div className="sticky top-20 z-30 bg-white/90 rounded-lg shadow flex justify-between items-center px-4 py-2 border border-slate-100">
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-600 flex items-center gap-1" title="Switch to text mode">
                  <DocumentTextIcon className="h-4 w-4" /> Text
                </span>
                <Switch
                  checked={enabled}
                  onChange={setEnabled}
                  className={`${
                    enabled ? "bg-indigo-600" : "bg-gray-300"
                  } relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400`}
                  aria-label="Toggle code/text mode"
                >
                  <span
                    className={`${
                      enabled ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform`}
                  />
                </Switch>
                <span className="font-medium text-gray-600 flex items-center gap-1" title="Switch to code mode">
                  <CodeBracketIcon className="h-4 w-4" /> Code
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="relative px-4 py-1.5 text-base font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-purple-400 text-white shadow hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isEdit ? "💾 Update" : "💾 Save"}
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (isCodeMode) setCode("");
                    else setText("");
                  }}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  title="Clear content"
                >
                  <TrashIcon className="h-4 w-4" /> Clear
                </button>
              </div>
            </div>

            {/* Editor Area */}
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-inner relative bg-slate-50">
              {isCodeMode ? (
                <textarea
                  className="w-full h-[55vh] p-5 text-base font-mono bg-black text-lime-400 outline-none resize-none rounded-lg"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="// Start writing your code here..."
                  aria-label="Code content"
                  spellCheck={false}
                />
              ) : (
                <div>
                  <div className="flex justify-end px-4 py-2 bg-slate-100 border-b">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(text);
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      title="Copy text"
                    >
                      <ClipboardIcon className="h-4 w-4" /> Copy
                    </button>
                  </div>
                  <textarea
                    className="w-full h-[55vh] p-5 text-base font-mono bg-gray-50 outline-none resize-none rounded-lg"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Start documenting your thoughts..."
                    aria-label="Note content"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Notification */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-emerald-400 text-white px-6 py-3 rounded-xl shadow-2xl font-semibold text-base z-50 flex items-center gap-3 border-2 border-white"
          >
            <span className="text-xl">✅</span> Content saved!
            <button
              onClick={() => setSaved(false)}
              className="ml-2 text-white hover:text-gray-200 text-lg font-bold focus:outline-none"
              title="Close"
            >
              ×
            </button>
          </motion.div>
        )}
        {error && error}
      </main>
    </div>
  );
}
