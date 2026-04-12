import { nanoid } from "nanoid";
import { Result } from "better-result";
import { sql } from "kysely";
import type { Database } from "../../services/database.ts";
import { dbError } from "../../errors.ts";
import type { CreateTemplate, UpdateTemplate } from "./schema.ts";

type Deps = { db: Database };

export const makeTemplatesDomain = ({ db }: Deps) => ({
  list: () =>
    Result.tryPromise({
      try: () => db.selectFrom("templates").selectAll().orderBy("createdAt", "asc").execute(),
      catch: dbError("Failed to list templates"),
    }),

  get: (id: string) =>
    Result.tryPromise({
      try: () =>
        db.selectFrom("templates").selectAll().where("id", "=", id).executeTakeFirstOrThrow(),
      catch: dbError("Template not found"),
    }),

  create: (input: CreateTemplate) => {
    const id = nanoid();
    return Result.tryPromise({
      try: () =>
        db
          .insertInto("templates")
          .values({
            id,
            name: input.name,
            description: input.description ?? null,
            sections: JSON.stringify(input.sections),
            isDefault: 0,
          })
          .returningAll()
          .executeTakeFirstOrThrow(),
      catch: dbError("Failed to create template"),
    });
  },

  update: (id: string, input: UpdateTemplate) =>
    Result.tryPromise({
      try: () =>
        db
          .updateTable("templates")
          .set({
            ...(input.name !== undefined ? { name: input.name } : {}),
            ...(input.description !== undefined ? { description: input.description } : {}),
            ...(input.sections !== undefined ? { sections: JSON.stringify(input.sections) } : {}),
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where("id", "=", id)
          .returningAll()
          .executeTakeFirstOrThrow(),
      catch: dbError("Failed to update template"),
    }),

  delete: (id: string) =>
    Result.tryPromise({
      try: async () => {
        await db.deleteFrom("templates").where("id", "=", id).execute();
        return { deleted: true };
      },
      catch: dbError("Failed to delete template"),
    }),
});

export type TemplatesDomain = ReturnType<typeof makeTemplatesDomain>;
