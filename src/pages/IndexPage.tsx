import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { motion } from "motion/react";
import { Plus, Search, Pin, FolderPlus, Folder, CheckSquare, Square } from "lucide-react";
import DeleteModal from "../components/homepage/DeleteModal";
import NoteCard from "../components/homepage/NoteCard";
import CreateFolder from "../components/folders/CreateFolders";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import UnlockModal from "../components/folders/UnlockFolders";

interface RoughNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  isPinned: boolean;
  isLocked?: boolean;
  folder_id?: string | null;
}

interface FolderItem {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export default function IndexPage() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const navigate = useNavigate();

  const [notes, setNotes] = useState<RoughNote[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [filtered, setFiltered] = useState<RoughNote[]>([]);
  const [search, setSearch] = useState<string>("");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showCreateFolder, setShowCreateFolder] = useState<boolean>(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [moveToFolderMode, setMoveToFolderMode] = useState<null | string>(null); // folderId or null
  const [moving, setMoving] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [noteToUnlock, setNoteToUnlock] = useState<RoughNote | null>(null);
  const [unlockError, setUnlockError] = useState("");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<FolderItem | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<FolderItem | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const fetchNotes = useCallback(async () => {
    const { data, error } = await supabase
      .from("roughnotes")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotes(data as RoughNote[]);
      setFiltered(data as RoughNote[]);
    }
  },[supabase, user?.id]);

  const fetchFolders = useCallback(async () => {
    const { data, error } = await supabase
      .from("roughfolders")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setFolders(data as FolderItem[]);
    }
  },[supabase, user?.id]);

  useEffect(() => {
    if (user) {
      fetchNotes();
      fetchFolders();
    }
  }, [fetchFolders, fetchNotes, user]);

  useEffect(() => {
    const lower = search.toLowerCase();
    setFiltered(
      notes.filter(
        (n) =>
          n.title?.toLowerCase().includes(lower) ||
          n.content?.toLowerCase().includes(lower) ||
          n.tags?.some((tag: string) => tag.toLowerCase().includes(lower))
      )
    );
  }, [search, notes]);

  const createNewPage = (folderId?: string) => {
    if (folderId) {
      navigate(`/page/${Date.now()}?folderId=${folderId}`);
    } else {
      navigate(`/page/${Date.now()}`);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("roughnotes").delete().eq("id", id);
    setShowModal(false);
    setSelectedNoteId(null);
    fetchNotes();
  };

  const handleTogglePin = async (note: RoughNote) => {
    const { error } = await supabase
      .from("roughnotes")
      .update({ isPinned: !note.isPinned })
      .eq("id", note.id);

    if (!error) fetchNotes();
  };

  const handleToggleLock = async (note: RoughNote) => {
    const { error } = await supabase
      .from("roughnotes")
      .update({ isLocked: !note.isLocked })
      .eq("id", note.id);

    if (!error) fetchNotes();
  };

  const moveNoteToFolder = async (noteId: string, folderId: string) => {
    await supabase.from("roughnotes").update({ folder_id: folderId }).eq("id", noteId);
  };

  async function handleMoveSelected(folderId: string) {
    await Promise.all(Array.from(selectedNotes).map((id) => moveNoteToFolder(id, folderId)));
    setSelectedNotes(new Set());
    fetchNotes();
  }

  function groupBy<T, K extends string | number>(
    arr: T[],
    keyFn: (item: T) => K
  ): [K, T[]][] {
    const map = new Map<K, T[]>();
    arr.forEach((item) => {
      const key = keyFn(item);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    return Array.from(map.entries());
  }

  const pinnedNotes = filtered.filter((n) => n.isPinned);
  const pinnedIds = new Set(pinnedNotes.map(n => n.id));
  const nonPinned = filtered.filter((n) => !pinnedIds.has(n.id) && !n.folder_id);
  const groupedByMonth = groupBy(nonPinned, (note) =>
    dayjs(note.created_at).format("MMMM YYYY")
  );

  const notesInSelectedFolder = notes.filter(
    (n) => n.folder_id === selectedFolderId
  );

  async function verifyPassword(password: string): Promise<boolean> {
    if (!user || !user.email) return false;
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });
    return !error;
  }

  const handleUnlockRequest = (note: RoughNote) => {
    setNoteToUnlock(note);
    setUnlockModalOpen(true);
    setUnlockError("");
  };

  const handleUnlockSubmit = async (password: string) => {
    const isValid = await verifyPassword(password);
    if (isValid && noteToUnlock) {
      await handleToggleLock(noteToUnlock); // Unlock the note
      setUnlockModalOpen(false);
      setNoteToUnlock(null);
      setUnlockError("");
      navigate(`/page/${noteToUnlock.id}?isedit=true`);
    } else {
      setUnlockError("Incorrect password");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen text-black pt-24 px-6 font-inter"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">Your Notes</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <button
              onClick={() => createNewPage()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" /> New Note
            </button>
          </div>
        </div>

        {/* Folders Section */}
        <div className="mb-12">
          <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Folder className="w-5 h-5" /> Folders
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {folders.map((folder) => {
              const notesInFolder = notes.filter(n => n.folder_id === folder.id);
              const hasNotes = notesInFolder.length > 0;
              return (
                <motion.div
                  key={folder.id}
                  whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}
                  className={`relative p-6 bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-2xl shadow-md flex flex-col items-start transition group cursor-pointer ${hasNotes ? "hover:ring-2 hover:ring-indigo-300" : ""}`}
                  onClick={() => {
                    if (hasNotes) {
                      setSelectedFolderId(folder.id); // Open folder to view notes
                    } else {
                      setMoveToFolderMode(folder.id); // Open move-to-folder modal
                      setSelectedNotes(new Set());
                    }
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Folder className="w-7 h-7 text-yellow-500" />
                    <span className="font-bold text-lg truncate">{folder.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{dayjs(folder.created_at).format("MMM D, YYYY")}</span>
                  <span className="mt-2 text-xs text-gray-500">{notesInFolder.length} notes</span>
                  {/* Actions on hover */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      className="p-1 rounded hover:bg-gray-100"
                      onClick={e => {
                        e.stopPropagation();
                        setFolderToEdit(folder);
                        setRenameValue(folder.name);
                        setShowRenameModal(true);
                      }}
                      aria-label="Rename folder"
                    >
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6l11-11a2.828 2.828 0 0 0-4-4L5 17v4z"/></svg>
                    </button>
                    <button
                      className="p-1 rounded hover:bg-gray-100"
                      onClick={e => {
                        e.stopPropagation();
                        setFolderToDelete(folder);
                        setShowDeleteFolderModal(true);
                      }}
                      aria-label="Delete folder"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                </motion.div>
              );
            })}
            {/* Add new folder card */}
            <motion.div
              whileHover={{ scale: 1.05, backgroundColor: "#fef3c7" }}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-yellow-300 rounded-2xl cursor-pointer transition"
              onClick={() => setShowCreateFolder(true)}
            >
              <FolderPlus className="w-8 h-8 text-yellow-400 mb-2" />
              <span className="font-semibold text-yellow-600">New Folder</span>
            </motion.div>
          </div>
        </div>

        {/* Create Folder Modal */}
        <CreateFolder
          open={showCreateFolder}
          onClose={() => setShowCreateFolder(false)}
          onFolderCreated={fetchFolders}
        />

        {/* Move to Folder Modal */}
        {moveToFolderMode && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-lg relative">
              <h3 className="text-xl font-bold mb-4">Select notes to move to folder</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {notes.map((note) => {
                  const checked = selectedNotes.has(note.id);
                  return (
                    <motion.div
                      key={note.id}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-center p-3 rounded-lg border ${checked ? "border-indigo-500 bg-indigo-50" : "border-gray-200 bg-white"} shadow-sm cursor-pointer`}
                      onClick={() => {
                        const updated = new Set(selectedNotes);
                        if (updated.has(note.id)) {
                          updated.delete(note.id);
                        } else {
                          updated.add(note.id);
                        }
                        setSelectedNotes(updated);
                      }}
                    >
                      <span className="mr-3 group">
                        {checked ? (
                          <CheckSquare className="text-indigo-600 w-6 h-6 group-hover:scale-110 transition-transform" />
                        ) : (
                          <Square className="text-gray-400 w-6 h-6 group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
                        )}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold">{note.title}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setMoveToFolderMode(null)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                  disabled={moving}
                >
                  Cancel
                </button>
                <button
                  disabled={selectedNotes.size === 0 || moving}
                  onClick={async () => {
                    setMoving(true);
                    await handleMoveSelected(moveToFolderMode);
                    setMoving(false);
                    setMoveToFolderMode(null);
                  }}
                  className={`px-4 py-2 rounded bg-indigo-600 text-white font-semibold transition ${selectedNotes.size === 0 || moving ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"}`}
                >
                  {moving ? "Moving..." : `Move ${selectedNotes.size} Note${selectedNotes.size !== 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Back Button if Folder Selected */}
        {selectedFolderId && (
          <button
            className="mb-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => setSelectedFolderId(null)}
          >
            ← Back to All Notes
          </button>
        )}

        {/* Notes in Selected Folder */}
        {selectedFolderId ? (
          <>
            <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Folder className="w-5 h-5" />
              {folders.find(f => f.id === selectedFolderId)?.name || "Folder"}
            </h4>
            <button
              className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              onClick={() => createNewPage()}
            >
              <Plus className="w-4 h-4 inline mr-2" /> New Note in this Folder
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {notesInSelectedFolder.length > 0 ? (
                notesInSelectedFolder.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.03, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer group relative border border-gray-100"
                    onClick={() => navigate(`/page/${note.id}?isedit=true`)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-lg truncate">{note.title}</span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <Pin onClick={e => { e.stopPropagation(); handleTogglePin(note); }} className={`w-5 h-5 cursor-pointer ${note.isPinned ? "text-yellow-500" : "text-gray-300"}`} />
                        <Square onClick={e => { e.stopPropagation(); handleToggleLock(note); }} className={`w-5 h-5 cursor-pointer ${note.isLocked ? "text-red-400" : "text-gray-300"}`} />
                        <button onClick={e => { e.stopPropagation(); setSelectedNoteId(note.id); setShowModal(true); }}>
                          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 line-clamp-3">{note.content}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {note.tags.map(tag => (
                        <span key={tag} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">{tag}</span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 mt-2 block">{dayjs(note.created_at).fromNow()}</span>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-400 py-12">
                  No notes in this folder.
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
              <div className="mb-12">
                <h4 className="text-lg font-semibold text-yellow-600 mb-4 flex items-center gap-2">
                  <Pin className="w-5 h-5" /> Pinned
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onClick={() => navigate(`/page/${note.id}?isedit=true`)}
                      onDelete={(id: string) => {
                        setSelectedNoteId(id);
                        setShowModal(true);
                      }}
                      onTogglePin={handleTogglePin}
                      onToggleLock={handleToggleLock}
                      onUnlockRequest={handleUnlockRequest}
                      isSelected={selectedNotes.has(note.id)}
                      onSelectToggle={(id) => {
                        const updated = new Set(selectedNotes);
                        if(updated.has(id)){
                          updated.delete(id) 
                        } 
                        else {
                          updated.add(id)
                        };
                        setSelectedNotes(updated);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Grouped Notes */}
            {groupedByMonth.map(([month, notesInMonth]) => (
              <div key={month} className="mb-12">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">{month}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notesInMonth.map((note: RoughNote) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onClick={() => navigate(`/page/${note.id}?isedit=true`)}
                      onDelete={(id: string) => {
                        setSelectedNoteId(id);
                        setShowModal(true);
                      }}
                      onTogglePin={handleTogglePin}
                      onToggleLock={handleToggleLock}
                      onUnlockRequest={handleUnlockRequest}
                      isSelected={selectedNotes.has(note.id)}
                      onSelectToggle={(id) => {
                        const updated = new Set(selectedNotes);
                        if(updated.has(id)){
                          updated.delete(id) 
                        } 
                        else {
                          updated.add(id)
                        };
                        setSelectedNotes(updated);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Empty State */}
            {filtered.length === 0 && (
              <div className="mt-24 text-center text-gray-500">
                <img src="/empty-state.svg" alt="No notes" className="mx-auto mb-6 w-32 opacity-80" />
                <p className="mb-4 text-lg">No notes found. Try creating one!</p>
                <button
                  onClick={() => createNewPage()}
                  className="inline-block px-6 py-2 font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg hover:shadow-lg"
                >
                  Create First Note
                </button>
              </div>
            )}
          </>
        )}

        <DeleteModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={() => selectedNoteId && handleDelete(selectedNoteId)}
        />
        <UnlockModal
          isOpen={unlockModalOpen}
          onClose={() => { setUnlockModalOpen(false); setUnlockError(""); }}
          onSubmit={handleUnlockSubmit}
          noteTitle={noteToUnlock?.title || ""}
        />
        {unlockModalOpen && unlockError && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="absolute top-[60%] bg-red-100 text-red-700 px-4 py-2 rounded shadow">
              {unlockError}
            </div>
          </div>
        )}

        {showRenameModal && folderToEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
              <h3 className="text-lg font-bold mb-4">Rename Folder</h3>
              <input
                className="w-full border rounded px-3 py-2 mb-4"
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  onClick={() => setShowRenameModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-indigo-600 text-white"
                  onClick={async () => {
                    await supabase
                      .from("roughfolders")
                      .update({ name: renameValue })
                      .eq("id", folderToEdit.id);
                    setShowRenameModal(false);
                    setFolderToEdit(null);
                    fetchFolders();
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteFolderModal && folderToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
              <h3 className="text-lg font-bold mb-4">Delete Folder</h3>
              <p>Are you sure you want to delete <b>{folderToDelete.name}</b>? All notes in this folder will remain but will be unassigned from any folder.</p>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  onClick={() => setShowDeleteFolderModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-red-600 text-white"
                  onClick={async () => {
                    // Remove folder_id from notes in this folder
                    await supabase
                      .from("roughnotes")
                      .update({ folder_id: null })
                      .eq("folder_id", folderToDelete.id);
                    // Delete the folder
                    await supabase
                      .from("roughfolders")
                      .delete()
                      .eq("id", folderToDelete.id);
                    setShowDeleteFolderModal(false);
                    setFolderToDelete(null);
                    fetchFolders();
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
