import { useEffect, useState } from "react";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import StarterKit from "@tiptap/starter-kit";
import { TemplateSectionNode } from "../editor/template-section-node.tsx";
import { api, type Template } from "../api.ts";
import { navigate } from "../router.ts";
import { Nav } from "./nav.tsx";
import type { TemplateSection } from "../../server/domains/templates/schema.ts";

type Props = {
  templateId: string | null;
};

const SectionDocument = Document.extend({ content: "templateSection+" });
const extensions = [StarterKit.configure({ document: false }), SectionDocument, TemplateSectionNode];

const newSectionKey = () => crypto.randomUUID();

const defaultDoc = (): JSONContent => ({
  type: "doc",
  content: [{ type: "templateSection", attrs: { key: newSectionKey(), label: "Section 1" } }],
});

const docFromTemplateSections = (sections: TemplateSection[]): JSONContent => ({
  type: "doc",
  content: sections.map((s) => ({
    type: "templateSection",
    attrs: { key: s.key, label: s.label },
  })),
});

const hasNestedSections = (sections: TemplateSection[]): boolean => {
  for (const s of sections) {
    if (s.children?.length) return true;
    if (s.children && hasNestedSections(s.children)) return true;
  }
  return false;
};

const extractSections = (doc: JSONContent): TemplateSection[] => {
  if (!doc.content) return [];
  const templateSections = doc.content.filter((node) => node.type === "templateSection");
  return templateSections.map((node, i) => {
    const rawKey = (node.attrs?.key as string | undefined)?.trim();
    const key = rawKey || `section-${i + 1}`;
    const label = (node.attrs?.label as string)?.trim() || `Section ${i + 1}`;
    return { key, label };
  });
};

const labelsValid = (sections: TemplateSection[]): boolean =>
  sections.length > 0 && sections.every((s) => s.label.trim().length > 0);

type ReadyFields = {
  name: string;
  description: string;
  initialDoc: JSONContent;
};

const fieldClass =
  "w-full rounded border border-neutral-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400";

const primaryBtn =
  "rounded bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-700 disabled:opacity-50";

const secondaryBtn =
  "rounded border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-800 hover:bg-neutral-50 disabled:opacity-50";

const textLink = "text-xs text-neutral-500 hover:text-neutral-800";

const TemplateEditorInner = ({
  templateId,
  initialDoc,
  name,
  description,
}: {
  templateId: string | null;
  initialDoc: JSONContent;
  name: string;
  description: string;
}) => {
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor(
    {
      extensions,
      content: initialDoc,
    },
    [initialDoc],
  );

  const handleAddSection = () => {
    if (!editor) return;
    const doc = editor.state.doc;
    const pos = doc.content.size;
    const n = doc.childCount;
    editor
      .chain()
      .focus()
      .insertContentAt(pos, {
        type: "templateSection",
        attrs: { key: newSectionKey(), label: `Section ${n + 1}` },
      })
      .run();
  };

  const handleSave = async () => {
    if (!editor) return;
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Template name is required.");
      return;
    }
    const sections = extractSections(editor.getJSON());
    if (sections.length < 1) {
      setError("Add at least one section.");
      return;
    }
    if (!labelsValid(sections)) {
      setError("Every section needs a name.");
      return;
    }
    try {
      if (templateId) {
        await api.templates.update(templateId, {
          name: trimmedName,
          description: description.trim() || undefined,
          sections,
        });
      } else {
        await api.templates.create({
          name: trimmedName,
          description: description.trim() || undefined,
          sections,
        });
      }
      navigate("/templates");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed.");
    }
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={handleAddSection} disabled={!editor} className={secondaryBtn}>
          Add Section
        </button>
        <button type="button" onClick={handleSave} disabled={!editor} className={primaryBtn}>
          Save Template
        </button>
      </div>

      {error ? (
        <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
      ) : null}

      <div className="min-h-[200px] rounded-lg border border-neutral-200 bg-white p-2 [&_.ProseMirror]:min-h-[180px] [&_.ProseMirror]:outline-none">
        <EditorContent editor={editor} className="prose prose-sm max-w-none" />
      </div>
    </>
  );
};

export const TemplateEditor = ({ templateId }: Props) => {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nestedBlocked, setNestedBlocked] = useState<{ name: string; description: string } | null>(null);
  const [ready, setReady] = useState<ReadyFields | null>(() =>
    templateId ? null : { name: "", description: "", initialDoc: defaultDoc() },
  );

  useEffect(() => {
    if (!templateId) {
      setNestedBlocked(null);
      setLoadError(null);
      return;
    }

    let cancelled = false;
    setReady(null);
    setNestedBlocked(null);
    setLoadError(null);

    api.templates
      .get(templateId)
      .then((t: Template) => {
        if (cancelled) return;
        const sections = JSON.parse(t.sections) as TemplateSection[];
        if (hasNestedSections(sections)) {
          setNestedBlocked({ name: t.name, description: t.description ?? "" });
          return;
        }
        setReady({
          name: t.name,
          description: t.description ?? "",
          initialDoc: docFromTemplateSections(sections),
        });
      })
      .catch((e: unknown) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Failed to load template.");
      });

    return () => {
      cancelled = true;
    };
  }, [templateId]);

  if (loadError) {
    return (
      <div>
        <Nav current="templates" />
        <div className="mx-auto max-w-2xl p-6 text-sm text-red-700">{loadError}</div>
      </div>
    );
  }

  if (templateId && nestedBlocked) {
    return (
      <div>
        <Nav current="templates" />
        <div className="mx-auto max-w-2xl space-y-4 p-6">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl font-bold">Edit Template</h1>
            <button type="button" onClick={() => navigate("/templates")} className={textLink}>
              Back
            </button>
          </div>
          <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p className="font-medium">This template cannot be edited here</p>
            <p className="mt-2 text-amber-900/90">
              &quot;{nestedBlocked.name}&quot; uses nested sections. The template editor only supports flat section lists
              for now.
            </p>
          </div>
          {nestedBlocked.description ? (
            <p className="text-sm text-neutral-600">{nestedBlocked.description}</p>
          ) : null}
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div>
        <Nav current="templates" />
        <div className="mx-auto max-w-2xl p-6 text-sm text-neutral-500">Loading...</div>
      </div>
    );
  }

  const setFields = (patch: Partial<Pick<ReadyFields, "name" | "description">>) => {
    setReady((r) => (r ? { ...r, ...patch } : r));
  };

  return (
    <div>
      <Nav current="templates" />
      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl font-bold">{templateId ? "Edit Template" : "New Template"}</h1>
            <button type="button" onClick={() => navigate("/templates")} className={textLink}>
              Cancel
            </button>
          </div>
          <div className="space-y-2">
            <input
              className={fieldClass}
              placeholder="Template name"
              value={ready.name}
              onChange={(e) => setFields({ name: e.target.value })}
            />
            <textarea
              className={fieldClass}
              placeholder="Description"
              rows={2}
              value={ready.description}
              onChange={(e) => setFields({ description: e.target.value })}
            />
          </div>
        </div>

        <TemplateEditorInner
          key={templateId ?? "new"}
          templateId={templateId}
          initialDoc={ready.initialDoc}
          name={ready.name}
          description={ready.description}
        />
      </div>
    </div>
  );
};
