import { z } from "zod";

export const CreateProjectSchema = z.object({
  name: z.string().min(1),
  templateId: z.string().min(1),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  braindump: z.any().optional(),
  script: z.any().optional(),
});

export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;
