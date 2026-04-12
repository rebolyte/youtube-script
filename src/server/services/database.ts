import {
  CamelCasePlugin,
  Generated,
  Kysely,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
} from "kysely";
import { BunSqliteDriver } from "./sqlite.ts";

export interface TemplatesTable {
  id: string;
  name: string;
  description: string | null;
  sections: string;
  isDefault: number;
  createdAt: Generated<string>;
  updatedAt: Generated<string>;
}

export interface ProjectsTable {
  id: string;
  name: string;
  templateId: string;
  braindump: string;
  script: string;
  createdAt: Generated<string>;
  updatedAt: Generated<string>;
}

export interface DatabaseSchema {
  templates: TemplatesTable;
  projects: ProjectsTable;
}

export type Database = Kysely<DatabaseSchema>;

export const createDatabase = (path: string): Database =>
  new Kysely<DatabaseSchema>({
    dialect: {
      createAdapter: () => new SqliteAdapter(),
      createDriver: () => new BunSqliteDriver(path),
      createIntrospector: (db) => new SqliteIntrospector(db),
      createQueryCompiler: () => new SqliteQueryCompiler(),
    },
    plugins: [new CamelCasePlugin()],
  });
