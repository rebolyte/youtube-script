import { Elysia } from "elysia";
import { Result } from "better-result";
import type { Container } from "./container.ts";
import { CreateTemplateSchema, UpdateTemplateSchema } from "./domains/templates/schema.ts";
import { CreateProjectSchema, UpdateProjectSchema } from "./domains/projects/schema.ts";

const resultToResponse = <A, E extends { message: string }>(result: Result<A, E>) =>
  result.isOk()
    ? Response.json(result.value)
    : Response.json({ error: result.error.message }, { status: 400 });

export const createServer = (ctx: Container) =>
  new Elysia({ prefix: "/api" })
    .get("/health", () => ({ status: "ok" }))

    // Templates
    .get("/templates", async () => resultToResponse(await ctx.templates.list()))
    .get("/templates/:id", async ({ params }) =>
      resultToResponse(await ctx.templates.get(params.id)),
    )
    .post("/templates", async ({ body }) => {
      const parsed = CreateTemplateSchema.safeParse(body);
      if (!parsed.success) return Response.json({ error: parsed.error.issues }, { status: 400 });
      return resultToResponse(await ctx.templates.create(parsed.data));
    })
    .put("/templates/:id", async ({ params, body }) => {
      const parsed = UpdateTemplateSchema.safeParse(body);
      if (!parsed.success) return Response.json({ error: parsed.error.issues }, { status: 400 });
      return resultToResponse(await ctx.templates.update(params.id, parsed.data));
    })
    .delete("/templates/:id", async ({ params }) =>
      resultToResponse(await ctx.templates.delete(params.id)),
    )

    // Projects
    .get("/projects", async () => resultToResponse(await ctx.projects.list()))
    .get("/projects/:id", async ({ params }) => resultToResponse(await ctx.projects.get(params.id)))
    .post("/projects", async ({ body }) => {
      const parsed = CreateProjectSchema.safeParse(body);
      if (!parsed.success) return Response.json({ error: parsed.error.issues }, { status: 400 });
      return resultToResponse(await ctx.projects.create(parsed.data));
    })
    .put("/projects/:id", async ({ params, body }) => {
      const parsed = UpdateProjectSchema.safeParse(body);
      if (!parsed.success) return Response.json({ error: parsed.error.issues }, { status: 400 });
      return resultToResponse(await ctx.projects.update(params.id, parsed.data));
    })
    .delete("/projects/:id", async ({ params }) =>
      resultToResponse(await ctx.projects.delete(params.id)),
    )

    // Generation
    .post("/projects/:id/generate", async ({ params }) => {
      const project = await ctx.projects.get(params.id);
      if (!project.isOk()) return Response.json({ error: "Project not found" }, { status: 404 });

      const template = await ctx.templates.get(project.value.templateId);
      if (!template.isOk()) return Response.json({ error: "Template not found" }, { status: 404 });

      const sections = JSON.parse(template.value.sections);
      const braindump = project.value.braindump !== "{}" ? project.value.braindump : "";

      if (!braindump) return Response.json({ error: "Braindump is empty" }, { status: 400 });

      const result = await ctx.generation.generate(braindump, sections);
      return resultToResponse(result);
    });
