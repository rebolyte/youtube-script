import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.transaction().execute(async (trx) => {
    await trx.schema
      .createTable("templates")
      .ifNotExists()
      .addColumn("id", "text", (col) => col.primaryKey())
      .addColumn("name", "text", (col) => col.notNull())
      .addColumn("description", "text")
      .addColumn("sections", "text", (col) => col.notNull().check(sql`json_valid(sections)`))
      .addColumn("is_default", "integer", (col) => col.notNull().defaultTo(0))
      .addColumn("created_at", "text", (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
      .addColumn("updated_at", "text", (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
      .execute();

    await trx.schema
      .createTable("projects")
      .ifNotExists()
      .addColumn("id", "text", (col) => col.primaryKey())
      .addColumn("name", "text", (col) => col.notNull())
      .addColumn("template_id", "text", (col) => col.notNull().references("templates.id"))
      .addColumn("braindump", "text", (col) => col.notNull().defaultTo("{}"))
      .addColumn("script", "text", (col) => col.notNull().defaultTo("{}"))
      .addColumn("created_at", "text", (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
      .addColumn("updated_at", "text", (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
      .execute();

    await trx.schema
      .createIndex("idx_projects_template")
      .ifNotExists()
      .on("projects")
      .column("template_id")
      .execute();
  });
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.transaction().execute(async (trx) => {
    await trx.schema.dropTable("projects").ifExists().execute();
    await trx.schema.dropTable("templates").ifExists().execute();
  });
}
