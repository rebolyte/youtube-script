import { Kysely } from "kysely";
import { nanoid } from "nanoid";

const demoWalkthrough = [
  { key: "hook", label: "Hook" },
  { key: "quick_demo", label: "Quick Demo" },
  {
    key: "in_depth_demo",
    label: "In-Depth Demo",
    children: [
      { key: "step_1", label: "Step 1" },
      { key: "step_2", label: "Step 2" },
      { key: "cta", label: "CTA" },
      { key: "step_3", label: "Step 3" },
    ],
  },
  { key: "outro", label: "Outro" },
];

const storyArc = [
  { key: "hook", label: "Hook" },
  { key: "establish_stakes", label: "Establish Stakes" },
  {
    key: "story_points",
    label: "Story Points",
    children: [
      { key: "sp_1", label: "Story Point 1" },
      { key: "mini_conclusion_1", label: "Mini Conclusion" },
      { key: "sp_2", label: "Story Point 2" },
      { key: "mini_conclusion_2", label: "Mini Conclusion" },
      { key: "sp_3", label: "Story Point 3" },
      { key: "big_conclusion", label: "Big Conclusion" },
    ],
  },
  { key: "outro", label: "Outro" },
];

export async function up(db: Kysely<any>): Promise<void> {
  await db
    .insertInto("templates")
    .values([
      {
        id: nanoid(),
        name: "Demo Walkthrough",
        description: "Hook, quick demo, then step-by-step deep dive with mid-video CTA",
        sections: JSON.stringify(demoWalkthrough),
        is_default: 1,
      },
      {
        id: nanoid(),
        name: "Story Arc",
        description: "Narrative structure with escalating story points and conclusions",
        sections: JSON.stringify(storyArc),
        is_default: 1,
      },
    ])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom("templates").where("is_default", "=", 1).execute();
}
