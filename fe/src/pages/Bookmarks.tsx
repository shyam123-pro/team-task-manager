import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/store/AppStore";
import { Bookmark, BookmarkX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";

const LS_KEY = "ttm_bookmarks_v1";

function loadIds(): string[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr.filter((x) => typeof x === "string");
    return [];
  } catch {
    return [];
  }
}

function saveIds(ids: string[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(ids));
}

export default function Bookmarks() {
  const { tasks, activeProject } = useApp();
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => setIds(loadIds()), []);

  const bookmarked = useMemo(() => {
    const set = new Set(ids);
    return tasks.filter((t) => set.has(t._id));
  }, [ids, tasks]);

  const unbookmark = (id: string) => {
    const next = ids.filter((x) => x !== id);
    setIds(next);
    saveIds(next);
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-md p-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-bold flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-primary" /> Bookmarks
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Pin and revisit important tasks{activeProject ? ` in ${activeProject.name}` : ""}.
          </p>
        </div>
        <Link to="/tasks" className="text-xs text-primary font-medium hover:underline">
          Go to tasks →
        </Link>
      </div>

      {bookmarked.length === 0 ? (
        <div className="glass rounded-md p-10 text-center text-sm text-muted-foreground">
          No bookmarks yet. Pin tasks from the Tasks page.
        </div>
      ) : (
        <div className="glass rounded-md overflow-hidden">
          <table className="data-table min-w-[800px]">
            <thead>
              <tr>
                <th>Task</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookmarked.map((t) => (
                <tr key={t._id}>
                  <td className="font-medium">{t.title}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td><PriorityBadge priority={t.priority} /></td>
                  <td className="tabular-nums">{new Date(t.dueDate).toISOString().slice(0, 10)}</td>
                  <td className="text-right">
                    <Button variant="outline" className="rounded-sm h-8" onClick={() => unbookmark(t._id)}>
                      <BookmarkX className="w-4 h-4 mr-1" /> Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

