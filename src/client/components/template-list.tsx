import { useState, useEffect } from "react";
import { api, type Template } from "../api.ts";
import { Nav } from "./nav.tsx";
import { navigate } from "../router.ts";

const sectionPreviewLine = (sectionsJson: string): string => {
  try {
    const parsed = JSON.parse(sectionsJson) as { label: string }[];
    return Array.isArray(parsed) ? parsed.map((s) => s.label).join(" → ") : "";
  } catch {
    return "";
  }
};

export const TemplateList = () => {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    api.templates.list().then(setTemplates);
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Delete this template?")) {
      await api.templates.delete(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <div>
      <Nav current="templates" />
      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Templates</h1>
          <button
            type="button"
            onClick={() => navigate("/template/new")}
            className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-700"
          >
            New Template
          </button>
        </div>

        {templates.length === 0 ? (
          <p className="text-sm text-neutral-500">No templates yet. Create one to get started.</p>
        ) : (
          <ul className="list-none space-y-2 p-0">
            {templates.map((t) => {
              const preview = sectionPreviewLine(t.sections);
              return (
                <li
                  key={t.id}
                  className="flex cursor-pointer items-center justify-between rounded border border-neutral-200 bg-white px-4 py-3 hover:bg-neutral-50"
                  onClick={() => navigate(`/template/${t.id}`)}
                >
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    {t.description ? (
                      <div className="mt-0.5 text-xs text-neutral-400">{t.description}</div>
                    ) : null}
                    {preview ? (
                      <div className="mt-1 text-xs text-neutral-400">{preview}</div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="shrink-0 text-xs text-red-500 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(t.id);
                    }}
                  >
                    Delete
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
