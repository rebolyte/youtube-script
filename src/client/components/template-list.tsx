import { useState, useEffect } from "react";
import { api, type Template } from "../api.ts";
import { Nav } from "./nav.tsx";

export const TemplateList = () => {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    api.templates.list().then(setTemplates);
  }, []);

  return (
    <div>
      <Nav current="templates" />
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="text-xl font-bold mb-4">Templates</h1>
        <ul className="space-y-2">
          {templates.map((t) => (
            <li key={t.id} className="rounded border border-neutral-200 bg-white px-4 py-3">
              <div className="font-medium text-sm">{t.name}</div>
              {t.description && (
                <div className="text-xs text-neutral-400 mt-1">{t.description}</div>
              )}
              <div className="text-xs text-neutral-300 mt-2">
                {(JSON.parse(t.sections) as { label: string }[]).map((s) => s.label).join(" → ")}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
