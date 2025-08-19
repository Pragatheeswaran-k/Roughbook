export interface RoughNote {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string, optional
  folderId?: string; // optional, if notes are organized in folders
  tags?: string[]; // optional, for tagging notes
  pinned?: boolean; // optional, for pinned notes
  locked?: boolean; // optional, for locked notes
}
