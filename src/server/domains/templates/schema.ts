import { z } from "zod";

export const TemplateSectionSchema: z.ZodType<TemplateSection> = z.object({
  key: z.string(),
  label: z.string(),
  children: z.lazy(() => z.array(TemplateSectionSchema)).optional(),
});

export type TemplateSection = {
  key: string;
  label: string;
  children?: TemplateSection[];
};

export const CreateTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sections: z.array(TemplateSectionSchema).min(1),
});

export const UpdateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  sections: z.array(TemplateSectionSchema).min(1).optional(),
});

export type CreateTemplate = z.infer<typeof CreateTemplateSchema>;
export type UpdateTemplate = z.infer<typeof UpdateTemplateSchema>;
