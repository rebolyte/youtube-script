import { createDatabase, type Database } from "./services/database.ts";
import { makeLogger, type Logger } from "./services/logger.ts";
import { type AppConfig, createConfig } from "./services/config.ts";
import { makeLlmService, type LLMService } from "./services/llm.ts";
import { makeTemplatesDomain, type TemplatesDomain } from "./domains/templates/index.ts";
import { makeProjectsDomain, type ProjectsDomain } from "./domains/projects/index.ts";
import { makeGenerationDomain, type GenerationDomain } from "./domains/generation/index.ts";

export type Services = {
  config: AppConfig;
  db: Database;
  log: Logger;
  llm: LLMService;
};

export type Container = Services & {
  templates: TemplatesDomain;
  projects: ProjectsDomain;
  generation: GenerationDomain;
};

export const makeContainer = async (
  overrides?: Partial<Services> & { config?: Partial<AppConfig> },
): Promise<Container> => {
  const config = createConfig(overrides?.config);
  const log = overrides?.log ?? (await makeLogger(config));
  const db = overrides?.db ?? createDatabase(config.DATABASE_PATH);
  const llm = overrides?.llm ?? makeLlmService(config, log);

  return {
    config,
    db,
    log,
    llm,
    templates: makeTemplatesDomain({ db }),
    projects: makeProjectsDomain({ db }),
    generation: makeGenerationDomain({ llm, log }),
  };
};
