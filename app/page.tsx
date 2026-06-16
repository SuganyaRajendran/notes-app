"use client";

import { useState, useEffect } from "react";

type Note = {
  id: number;
  title: string;
  body: string;
  updatedAt: string;
};

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selected, setSelected] = useState<Note | null>(null);
  const [search, setSearch] = useState("");
  const [nextId, setNextId] = useState(1);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("notes");
    if (saved) {
      const parsed = JSON.parse(saved) as Note[];
      setNotes(parsed);
      setNextId(parsed.length ? Math.max(...parsed.map((n) => n.id)) + 1 : 1);
      if (parsed.length) setSelected(parsed[0]);
    }
  }, []);

  function save(updated: Note[]) {
    setNotes(updated);
    localStorage.setItem("notes", JSON.stringify(updated));
  }

  function newNote() {
    const note: Note = {
      id: nextId,
      title: "Untitled",
      body: "",
      updatedAt: new Date().toISOString(),
    };
    setNextId((n) => n + 1);
    const updated = [note, ...notes];
    save(updated);
    setSelected(note);
    setDirty(false);
  }

  function updateSelected(field: "title" | "body", value: string) {
    if (!selected) return;
    const updated: Note = { ...selected, [field]: value, updatedAt: new Date().toISOString() };
    setSelected(updated);
    setDirty(true);
    save(notes.map((n) => (n.id === selected.id ? updated : n)));
  }

  function deleteNote(id: number) {
    const updated = notes.filter((n) => n.id !== id);
    save(updated);
    if (selected?.id === id) setSelected(updated[0] ?? null);
  }

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.body.toLowerCase().includes(search.toLowerCase())
  );

  function fmt(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="flex h-screen bg-stone-100 font-sans">
      {/* Sidebar */}
      <aside className="w-72 flex flex-col border-r border-stone-200 bg-stone-50 shrink-0">
        <div className="p-4 border-b border-stone-200 flex items-center justify-between">
          <h1 className="text-lg font-bold text-stone-800">📝 My Notes</h1>
          <button
            onClick={newNote}
            className="text-amber-600 hover:text-amber-800 text-2xl leading-none font-light transition-colors"
            title="New note"
          >
            +
          </button>
        </div>

        <div className="p-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
        </div>

        <ul className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <li className="text-center text-stone-400 text-sm py-8">
              {search ? "No results" : "No notes yet"}
            </li>
          )}
          {filtered.map((note) => (
            <li key={note.id}>
              <button
                onClick={() => { setSelected(note); setDirty(false); }}
                className={`w-full text-left px-4 py-3 border-b border-stone-100 group hover:bg-amber-50 transition-colors ${
                  selected?.id === note.id ? "bg-amber-100 border-l-2 border-l-amber-500" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-stone-800 text-sm truncate">
                    {note.title || "Untitled"}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all shrink-0 text-base leading-none"
                  >
                    ×
                  </button>
                </div>
                <p className="text-xs text-stone-400 mt-0.5 truncate">{note.body || "No content"}</p>
                <p className="text-xs text-stone-300 mt-1">{fmt(note.updatedAt)}</p>
              </button>
            </li>
          ))}
        </ul>

        <div className="p-3 border-t border-stone-200 text-xs text-stone-400 text-center">
          {notes.length} note{notes.length !== 1 ? "s" : ""}
        </div>
      </aside>

      {/* Editor */}
      <main className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="border-b border-stone-200 px-6 py-3 bg-white">
              <input
                type="text"
                value={selected.title}
                onChange={(e) => updateSelected("title", e.target.value)}
                className="w-full text-xl font-bold text-stone-800 focus:outline-none bg-transparent placeholder:text-stone-300"
                placeholder="Title"
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-stone-400">
                  Last edited {fmt(selected.updatedAt)}
                </p>
                <p className="text-xs text-stone-300">
                  {selected.body.length} chars · {selected.body.trim().split(/\s+/).filter(Boolean).length} words
                </p>
              </div>
            </div>
            <textarea
              value={selected.body}
              onChange={(e) => updateSelected("body", e.target.value)}
              className="flex-1 resize-none p-6 text-stone-700 text-sm leading-relaxed focus:outline-none bg-white"
              placeholder="Start writing..."
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-400">
            <p className="text-4xl mb-4">📝</p>
            <p className="text-sm">No note selected</p>
            <button
              onClick={newNote}
              className="mt-4 text-amber-600 hover:text-amber-800 text-sm font-medium transition-colors"
            >
              Create your first note
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
