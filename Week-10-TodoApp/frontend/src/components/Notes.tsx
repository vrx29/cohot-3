import { useState } from "react";
import NotesCard from "./NotesCard";
import { Archive, ScrollText, Trash2 } from "lucide-react";

const notes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function Notes() {
  const [notesFilter, setNotesFilter] = useState(1);

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="mb-10">
        <h1 className="text-2xl">
          <span className="text-red-500">Hey,</span> Vineet!
        </h1>
      </div>
      <div className="mb-8">
        <h2 className="text-xl">Notes</h2>
        <p className="text-gray-400 font-light">
          Let's get started and take your first step towards creating your first
          note.
        </p>
      </div>
      <nav className="mb-6">
        <ul className="inline-flex gap-2 border-b text-slate-300">
          {[
            { id: 1, name: "All", icon: ScrollText },
            { id: 2, name: "Archived", icon: Archive },
            { id: 3, name: "Deleted", icon: Trash2 },
          ].map((i) => (
            <li
              key={i.id}
              onClick={() => setNotesFilter(i.id)}
              className={`py-2 px-4 text-gray-500 cursor-pointer flex gap-2 ${
                notesFilter === i.id ? "border-b-4 text-red-500" : ""
              }`}
            >
              <i.icon strokeWidth={1} />
              {i.name}
            </li>
          ))}
        </ul>
      </nav>
      <div
        className="grid
    gap-6
    grid-cols-[repeat(auto-fill,minmax(320px,1fr))]"
      >
        {/* // Create Note Card */}
        {notes.map((i) => (
          <NotesCard key={i} />
        ))}
      </div>
    </div>
  );
}
