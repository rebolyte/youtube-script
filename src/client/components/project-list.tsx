import { useState, useEffect } from "react";
import { api, type ProjectSummary } from "../api.ts";
import { navigate } from "../router.ts";
import { Nav } from "./nav.tsx";

export const ProjectList = () => {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [defaultTemplateId, setDefaultTemplateId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    api.projects.list().then(setProjects);
    api.templates.list().then((t) => {
      if (t.length > 0) setDefaultTemplateId(t[0].id);
    });
  }, []);

  const create = async () => {
    if (!newName.trim() || !defaultTemplateId) return;
    const project = await api.projects.create({ name: newName.trim(), templateId: defaultTemplateId });
    navigate(`/project/${project.id}`);
  };

  const remove = async (id: string) => {
    await api.projects.delete(id);
    setProjects((p) => p.filter((x) => x.id !== id));
  };

  return (
    <div>
      <Nav current="projects" />
      <div className="mx-auto max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Projects</h1>
          <button
            className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-700"
            onClick={() => setShowNew(!showNew)}
          >
            New Project
          </button>
        </div>

        {showNew && (
          <div className="mb-4 flex gap-2">
            <input
              className="flex-1 rounded border border-neutral-300 px-3 py-1.5 text-sm"
              placeholder="Project name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
              autoFocus
            />
            <button
              className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-700"
              onClick={create}
            >
              Create
            </button>
          </div>
        )}

        {projects.length === 0 ? (
          <p className="text-neutral-500 text-sm">No projects yet. Create one to get started.</p>
        ) : (
          <ul className="space-y-2">
            {projects.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded border border-neutral-200 bg-white px-4 py-3 hover:bg-neutral-50 cursor-pointer"
                onClick={() => navigate(`/project/${p.id}`)}
              >
                <div>
                  <div className="font-medium text-sm">{p.name}</div>
                  <div className="text-xs text-neutral-400">
                    {p.templateName} &middot; {new Date(p.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  className="text-xs text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(p.id);
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
