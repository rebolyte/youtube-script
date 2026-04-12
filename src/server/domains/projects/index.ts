import { nanoid } from "nanoid";
import { Result } from "better-result";
import { sql } from "kysely";
import type { Database } from "../../services/database.ts";
import { dbError } from "../../errors.ts";
import type { CreateProject, UpdateProject } from "./schema.ts";

type Deps = { db: Database };

export const makeProjectsDomain = ({ db }: Deps) => ({
  list: () =>
    Result.tryPromise({
      try: () =>
        db
          .selectFrom("projects")
          .innerJoin("templates", "templates.id", "projects.templateId")
          .select([
            "projects.id",
            "projects.name",
            "projects.templateId",
            "templates.name as templateName",
            "projects.updatedAt",
            "projects.createdAt",
          ])
          .orderBy("projects.updatedAt", "desc")
          .execute(),
      catch: dbError("Failed to list projects"),
    }),

  get: (id: string) =>
    Result.tryPromise({
      try: () =>
        db.selectFrom("projects").selectAll().where("id", "=", id).executeTakeFirstOrThrow(),
      catch: dbError("Project not found"),
    }),

  create: (input: CreateProject) => {
    const id = nanoid();
    return Result.tryPromise({
      try: () =>
        db
          .insertInto("projects")
          .values({
            id,
            name: input.name,
            templateId: input.templateId,
            braindump: "{}",
            script: "{}",
          })
          .returningAll()
          .executeTakeFirstOrThrow(),
      catch: dbError("Failed to create project"),
    });
  },

  update: (id: string, input: UpdateProject) =>
    Result.tryPromise({
      try: () =>
        db
          .updateTable("projects")
          .set({
            ...(input.name !== undefined ? { name: input.name } : {}),
            ...(input.templateId !== undefined ? { templateId: input.templateId } : {}),
            ...(input.braindump !== undefined ? { braindump: input.braindump } : {}),
            ...(input.script !== undefined ? { script: input.script } : {}),
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where("id", "=", id)
          .returningAll()
          .executeTakeFirstOrThrow(),
      catch: dbError("Failed to update project"),
    }),

  delete: (id: string) =>
    Result.tryPromise({
      try: async () => {
        await db.deleteFrom("projects").where("id", "=", id).execute();
        return { deleted: true };
      },
      catch: dbError("Failed to delete project"),
    }),
});

export type ProjectsDomain = ReturnType<typeof makeProjectsDomain>;
