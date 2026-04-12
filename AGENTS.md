# YouTube Script Tool

Braindump-to-script generator: pick a template, dump notes, get structured bullet-point talking points organized by template sections. Uses BlockNote editors for both braindump and script panes.

## Validate your changes

- `mise run ts:check`
- `mise run lint`
- `mise run test`

## Guidelines

- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision
- Do not add comments in any code unless it has high cyclomatic complexity; prefer clear function/variable names
- Never remove existing comments
- Do not use emojis
- Keep things simple, do not over-abstract, and always remember YAGNI; avoid helper functions when a simple inline expression would suffice
- Components should be simple enough that correctness is self-evident. Build small, focused pieces that obviously can't break, then compose them hierarchically into larger structures.

## FP "light" / railway programming

State is the mind-killer. I'm going for "FP light", so call out any choices made around impure functions/architecture.

Avoid:

- Classes (unless wrapping a stateful resource like a connection pool)
- `this`
- Mutation (use Remeda's set, merge, omit for immutable updates)
- Throwing errors (errors are values, return `import { Result } from "better-result"` instead)
- God services that do multiple things

The theme: data in, data out, effects at the edges.

## Use Bun

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` serves static HTML + REST API. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

## Architecture

- Bun server (`server.ts`) serves React SPA via HTML import + Elysia REST API under `/api`
- SQLite via Kysely for persistence (templates, projects)
- Anthropic SDK for script generation
- BlockNote editors for braindump (free-form) and script (custom ScriptSection blocks)
- No RPC, no WebSockets — simple REST
