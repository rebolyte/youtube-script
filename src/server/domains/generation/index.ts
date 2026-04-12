import { Result } from "better-result";
import type { LLMService } from "../../services/llm.ts";
import type { Logger } from "../../services/logger.ts";
import type { TemplateSection } from "../templates/schema.ts";
import { buildGenerationPrompt } from "./prompt.ts";
import type { AppError } from "../../errors.ts";

type Deps = { llm: LLMService; log: Logger };

export const makeGenerationDomain = ({ llm, log }: Deps) => ({
  generate: async (
    braindump: string,
    sections: TemplateSection[],
  ): Promise<Result<string, AppError>> => {
    const systemPrompt = buildGenerationPrompt(sections);

    void log.info`Generating script from braindump (${braindump.length} chars, ${sections.length} sections)`;

    return llm.generateText({
      messages: [{ role: "user", content: braindump }],
      systemPrompt,
    });
  },
});

export type GenerationDomain = ReturnType<typeof makeGenerationDomain>;
