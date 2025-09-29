# TypeScript OO Application Plan (Node 22+, pnpm)

> Aligns with `reference/project-plans/dreamweaver-narrative-application-requirements.md` to honour the Story → Chapter → Arc → Moment → Scene architecture and the Dreamweaver Scene Desk mandate.

## Purpose & Scope
- Produce a modular TypeScript 5.x application (`omega-dreamweaver-hub`) that powers the Dreamweaver Scene Desk dashboard while showcasing SOLID, decorators, generics, and advanced OO concepts.
- Ensure every feature is validated through executable pnpm scripts that drive the Scene Desk UI, allowing reviewers to interact with real scene generation before approving merges.

## Target Application Overview
- **Primary Goal**: Deliver the Dreamweaver Scene Desk so operators can traverse the narrative hierarchy, generate scenes, and inspect diagnostics in real time.
- **Runtime Surfaces**:
  - Scene Desk SPA: `pnpm run scene-desk` boots Fastify plus Vite, serving a React dashboard that lists stories/chapters/arcs/moments, renders `SceneDescriptor` details, and shows restriction/mood/branch insights.
  - REST API: Fastify (ESM) delivering `/scenes/next` endpoint feeding the Scene Desk and other integrations.
  - CLI helpers are optional and must proxy Scene Desk flows; no headless-only features allowed.
- **Layered Architecture**:
  - Core domain (`Story`, `Chapter`, `Arc`, `Moment`, `Scene`) implemented with classes, abstract base types, discriminated unions, dependency inversion via `tsyringe` or `typedi`.
  - Application services (`ReferenceShelf`, `SceneAssembler`, `DreamweaverDirector`) orchestrating domain logic.
  - Infrastructure adapters (file storage, telemetry, HTTP, React UI presenters).

## Tooling Stack (Latest Stable Versions)
- **Package Manager**: `pnpm` with workspace support, Node.js ≥ 22.11.
- **Language**: TypeScript 5.x, `tsconfig` targeting `ES2023`, `moduleResolution bundler`.
- **Linting**: `eslint` with `@typescript-eslint` strict config, `eslint-plugin-functional`, `eslint-plugin-import`, `eslint-plugin-unicorn`.
- **Formatting**: `prettier` with `eslint-config-prettier` reconciliation.
- **Type Safety**: `tsc --noEmit`, `typescript-eslint` rules for explicit `override`, `noImplicitOverride`, `exactOptionalPropertyTypes`.
- **Testing**: `vitest` (unit + integration), `c8` coverage, `supertest` for HTTP contract tests, `uvu` or `jest` snapshots if needed.
- **Mocking / Fixtures**: `nock`, custom data builders (test-data-bot), contract tests with `pactum`.
- **Docs**: `typedoc` generating API site, `mkdocs` or `docusaurus` for architectural narrative.
- **CI**: GitHub Actions matrix (Ubuntu, macOS, Windows) running lint, type-check, tests, bundle, e2e CLI check.

## Engineering Workflow (Strict Reviews & Issue Discipline)
1. **Issue Creation**: every work item captured as GitHub Issue with DoD, test notes, PR checklist.
2. **Branch Naming**: `feature/#123-shelf-cache` or `chore/#042-update-to-typescript-5-5`.
3. **TDD Cycle**: write failing vitest spec (CLI, service, API), implement solution, rerun `pnpm test`.
4. **Commits**: follow Conventional Commits referencing issue (`feat(scene): add assembler #123`).
5. **Pull Requests**:
   - Require two approvals, blocking merges without.
   - Enforce status checks (lint, type-check, tests, docs).
   - Include manual verification evidence (CLI command output, HTTP cURL response).
6. **Merged via squash** with issue refs to keep history clean.

- **Test Levels**:
  - Unit: domain classes, guards, mappers, and utilities—written test-first and runnable headlessly.
  - Application: service orchestration with in-memory repositories plus contract tests for the Dreamweaver services.
  - Integration: Fastify routes with the real DI container and React component tests using Testing Library.
  - End-to-End: Playwright (or Vitest + happy-dom) journeys through the Scene Desk UI to validate the complete stack (kept minimal—smoke-level only).
- **Documentation Bridge**: each test suite captures notes (in README or test docblocks) describing how a developer/product lead can replicate the scenario via the Scene Desk application so automated results match observable behaviour.
- **Coverage Target**: ≥ 95% statements/branches enforced by `vitest --coverage`, limited to the shippable product surface; tests must remain meaningful even when run independently of the UI.
- **Golden Scenario**: `pnpm run scene-desk:e2e` seeds known datasets, launches the dev server, executes a scripted walk-through, and saves evidence artefacts for reviewers.
- **Contract Testing**: match `SceneDescriptor` schema vs JSON Schema stored in `/contracts` and validated with `ajv` during tests.

## VS Code Integration
- Provide `.vscode/extensions.json` recommending: `dbaeumer.vscode-eslint`, `esbenp.prettier-vscode`, `meganrogge.template-string-converter`, `orta.vscode-jest` (for vitest support), `yoavbls.pretty-ts-errors`.
- `.vscode/settings.json` enforcing pnpm as package manager, auto-fix on save (`editor.codeActionsOnSave`), `typescript.tsdk` pointing to workspace `node_modules/typescript/lib`.
- Tasks: `pnpm lint`, `pnpm test`, `pnpm run scene-desk`, `pnpm run dev` (Fastify server), `pnpm run scene-desk:e2e`, with integrated debug launch configs (Fastify, vitest watch, React app).
- Ensure vitest test explorer extension works for green/red cycles inside IDE.

## Modern OO Practices & Patterns
- Use abstract classes with `protected` constructors and `override` keywords.
- Employ Builder, Strategy, State, Command patterns where appropriate (document rationale per component).
- Favor value objects (readonly), sealed classes via discriminated unions, and immutability enforcement with ESLint rules.
- Introduce telemetry decorator (method decorator) for scene assembly timings.
- Provide dependency graphs via Nx or `depcruise` for visibility.

## Quality Gates & Automation
- Husky pre-commit: `pnpm lint:staged` (eslint + prettier), `pnpm typecheck`, `pnpm test --runInBand --coverage --watch=false`, `pnpm run scene-desk:lint` (component snapshot linting).
- Pre-push: `pnpm test --runInBand`, `pnpm run build`, `pnpm run scene-desk:e2e` smoke suite.
- SAST: `semgrep`, `npm audit` (with allowlist review), `depcheck` to detect unused deps.
- Observability: integrate `pino` with structured logging, `opentelemetry` hooks (optional).

## Milestones
1. **Initialization** (Issue #100): scaffold pnpm workspace, base configs, CI skeleton, architecture READMEs.
2. **Domain Layer** (Issue #101-#103): implement story hierarchy and tests with seed data.
3. **Application Services** (Issue #104-#106): ReferenceShelf, SceneAssembler, DreamweaverDirector powering Scene Desk controllers.
4. **Scene Desk UI** (Issue #107): Fastify routes, React components, integration tests, diagnostics panel.
5. **Developer Experience** (Issue #108): VS Code tasks, typedoc site, Nx graph, curated sample data pack, Storybook (optional) for Scene Desk components.
6. **Review & Hardening**: address reviewer feedback, run cross-platform CI, prep release notes.

## Deliverables
- `/typescript/omega-dreamweaver-hub` workspace with pnpm project, modular structure, docs, scripts, and the React Scene Desk app.
- GitHub workflow YAML enforcing gates, Dependabot config for npm ecosystem, and CI steps that build/test the Scene Desk.
- Review checklist asserting: issue linkage, two approvals, Scene Desk UI evidence (screenshots/video), vitest coverage, VS Code tasks validated.
