import type { TemplateSection } from "../templates/schema.ts";

const flattenSections = (sections: TemplateSection[], prefix = ""): string[] =>
  sections.flatMap((s) => {
    const label = prefix ? `${prefix} — ${s.label}` : s.label;
    if (s.children?.length) return flattenSections(s.children, label);
    return [label];
  });

export const buildGenerationPrompt = (sections: TemplateSection[]): string => {
  const sectionList = flattenSections(sections)
    .map((s) => `- ${s}`)
    .join("\n");

  return `You are a YouTube script organizer. The user will give you a braindump of notes and ideas for a video.

Your job is to organize those notes into a structured script following the template sections below. Output bullet-point talking points — conversational, not word-for-word teleprompter text.

## Template Sections
${sectionList}

## Output Format
For each section, output an H2 heading matching the section name exactly, followed by bullet points.

Example:
## Hook
- Open with the surprising stat about X
- Ask: "Have you ever wondered..."

## Quick Demo
- Show the end result first
- 30-second speed run of the workflow

Rules:
- Every section must appear in the output, even if only a placeholder bullet
- Keep bullets concise — these are talking points, not full sentences
- Preserve the user's voice and phrasing where possible
- If the braindump doesn't clearly map to a section, use your judgment to place it
- Do not add content the user didn't mention — only reorganize what they gave you`;
};
