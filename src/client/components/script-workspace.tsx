import { useState, useEffect, useCallback, useRef } from "react";
import { api, type Project, type Template } from "../api.ts";
import { navigate } from "../router.ts";
import { BraindumpEditor } from "./braindump-editor.tsx";
import { ScriptEditor } from "./script-editor.tsx";
import type { TemplateSection } from "../../server/domains/templates/schema.ts";
import type { JSONContent } from "@tiptap/react";
import { markdownToSectionDoc } from "../editor/markdown-to-doc.ts";

const flattenSections = (sections: TemplateSection[]): { key: string; label: string }[] =>
  sections.flatMap((s) =>
    s.children?.length
      ? s.children.map((c) => ({
          key: c.key,
          label: `${s.label} — ${c.label}`,
        }))
      : [{ key: s.key, label: s.label }],
  );

const tryParseJson = (s: string): JSONContent | null => {
  if (!s || s === "{}") return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

export const ScriptWorkspace = ({ projectId }: { projectId: string }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [template, setTemplate] = useState<Template | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptContent, setScriptContent] = useState<JSONContent | null>(null);
  const [scriptKey, setScriptKey] = useState(0);
  const braindumpRef = useRef<JSONContent | null>(null);

  useEffect(() => {
    Promise.all([api.projects.get(projectId), api.templates.list()]).then(([p, allTemplates]) => {
      setProject(p);
      setTemplates(allTemplates);
      braindumpRef.current = tryParseJson(p.braindump);
      setScriptContent(tryParseJson(p.script));
      const t = allTemplates.find((t) => t.id === p.templateId) ?? null;
      setTemplate(t);
    });
  }, [projectId]);

  const switchTemplate = async (templateId: string) => {
    const t = templates.find((t) => t.id === templateId);
    if (!t) return;
    if (!window.confirm("Switching templates will clear the current script. Continue?")) return;
    setTemplate(t);
    setScriptContent(null);
    setScriptKey((k) => k + 1);
    await api.projects.update(projectId, { templateId, script: "{}" });
    setProject((p) => (p ? { ...p, templateId } : p));
  };

  const saveBraindump = useCallback(
    async (doc: JSONContent) => {
      braindumpRef.current = doc;
      await api.projects.update(projectId, { braindump: JSON.stringify(doc) });
    },
    [projectId],
  );

  const saveScript = useCallback(
    async (doc: JSONContent) => {
      await api.projects.update(projectId, { script: JSON.stringify(doc) });
    },
    [projectId],
  );

  const generate = async () => {
    if (!braindumpRef.current) {
      setError("Write some notes in the braindump first");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const markdown = await api.projects.generate(projectId);
      if (!markdown.includes("## ")) {
        setError(`Generation did not produce a structured script: ${markdown.slice(0, 200)}`);
        return;
      }
      const sections: TemplateSection[] = template ? JSON.parse(template.sections) : [];
      const flat = flattenSections(sections);
      const doc = markdownToSectionDoc(markdown, flat);
      await api.projects.update(projectId, { script: JSON.stringify(doc) });
      setScriptContent(doc);
      setScriptKey((k) => k + 1);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  if (!project || !template) {
    return <div className="p-6 text-neutral-400">Loading...</div>;
  }

  const sections: TemplateSection[] = JSON.parse(template.sections);

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-2">
        <button
          className="text-sm text-neutral-500 hover:text-neutral-700"
          onClick={() => navigate("/")}
        >
          &larr; Back
        </button>
        <span className="text-sm font-semibold">{project.name}</span>
        <select
          className="text-xs text-neutral-500 bg-transparent border border-neutral-200 rounded px-2 py-1 cursor-pointer hover:border-neutral-400"
          value={template.id}
          onChange={(e) => switchTemplate(e.target.value)}
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <div className="flex-1" />
        <button
          className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-700 disabled:opacity-50"
          onClick={generate}
          disabled={generating}
        >
          {generating ? "Generating..." : "Generate Script"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Split pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Braindump pane */}
        <div className="flex-1 border-r border-neutral-200 overflow-auto">
          <div className="px-4 py-2 border-b border-neutral-100 bg-gray-100">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Braindump
            </span>
          </div>
          <div className="p-4">
            <BraindumpEditor initialContent={braindumpRef.current} onSave={saveBraindump} />
          </div>
        </div>

        {/* Script pane */}
        <div className="flex-1 overflow-auto">
          <div className="px-4 py-2 border-b border-neutral-100 bg-gray-100">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Script
            </span>
          </div>
          <div className="p-4">
            <ScriptEditor
              key={scriptKey}
              sections={sections}
              content={scriptContent}
              onSave={saveScript}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
