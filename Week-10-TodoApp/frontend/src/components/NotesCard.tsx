import { Trash2 } from "lucide-react";
import type { Note } from "../types/notes";

interface NotesCardProps {
  note: Note;
}

export default function NotesCard({ note }: NotesCardProps) {
  return (
    <div className="p-5 border border-gray-200 rounded-lg border-b-8 border-b-slate-900 w-full max-w-[480px]">
      <div className="mb-6 flex justify-between items-center">
        <span className="bg-pink-300 py-1 px-4 rounded text-sm">#1</span>
        <button className="cursor-pointer p-2">
          <Trash2 size={18} strokeWidth={1} />
        </button>
      </div>
      <div>
        <h3 className="text-lg">{note.title}</h3>
        <p className="py-4 text-sm font-light text-gray-500">
          {note.description}
        </p>
        <p className="mt-4 text-sm font-light text-gray-500">
          Created Data:{" "}
          <span className="font-normal text-gray-900">
            {new Date(note.createdAt).toDateString()}
          </span>
        </p>
      </div>
    </div>
  );
}
