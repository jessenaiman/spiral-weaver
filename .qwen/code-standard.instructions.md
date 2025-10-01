<!--- Copyright (C) Microsoft Corporation. All rights reserved. -->

# Spiral Weaver Code Standards

## Introduction

All code in this repository must adhere to a consistent, modern, and maintainable standard. This ensures:

- Code is easy to read and understand by all contributors
- Documentation is always available and up-to-date
- Tooling (such as IDEs and doc generators) can provide accurate information

## TSDoc Comments Requirement

**All exported functions, classes, and public methods must include TSDoc comments.**

TSDoc comments:

- Use the [TSDoc](https://tsdoc.org/) syntax
- Describe the purpose, parameters, return values, and any important remarks
- Are required for all exported symbols and all public methods of exported classes
- Should be updated whenever the implementation or API changes

### Example

```ts
/**
 * Returns the average of two numbers.
 *
 * @remarks
 * This method is part of the {@link core-library#Statistics | Statistics subsystem}.
 *
 * @param x - The first input number
 * @param y - The second input number
 * @returns The arithmetic mean of `x` and `y`
 *
 * @beta
 */
export function getAverage(x: number, y: number): number {
  return (x + y) / 2.0;
}
```

See [TSDoc documentation](https://tsdoc.org/) for full syntax and best practices.

## Running Tests

- **Unit tests:**
  - Run with: `pnpm test` or `pnpm test -- tests/unit/<file>.test.ts`
- **E2E tests (Playwright):**
  - Run with: `npx playwright test` or `npx playwright test tests/e2e/<file>.spec.ts`
- **Type checking:**
  - Run with: `npx tsc --noEmit --skipLibCheck`
- **Linting:**
  - Run with: `pnpm run lint`

All tests and lint checks must pass before submitting code for review.

## Naming Conventions

- **Files:**
  - TypeScript files: `kebab-case` (e.g., `my-component.tsx`)
  - Test files: `*.test.ts` for unit, `*.spec.ts` for E2E
- **Classes:** `PascalCase`
- **Functions/Variables:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **React Components:** `PascalCase`

## General Rules

- Write clear, maintainable, and DRY code
- Prefer TypeScript over JavaScript
- Use functional components and hooks for React
- Avoid magic numbers and strings; use named constants
- Always write TSDoc for exported/public APIs
- Keep functions and files small and focused
- Prefer composition over inheritance
- Use async/await for async code
- Handle errors gracefully

## Codacy Usage

- All code is automatically analyzed by Codacy for quality and security
- After every commit or file edit, Codacy CLI analysis is run (see `.github/instructions/codacy.instructions.md`)
- Fix all issues flagged by Codacy before merging
- For security: after adding dependencies, run `codacy_cli_analyze` with `trivy` (see Codacy instructions)

## Check-in, Push, and Review Validation Process

1. **Before pushing:**
   - Run all tests and lint/type checks locally
   - Ensure all TSDoc comments are present and up-to-date
   - Fix all Codacy issues
2. **Push to a feature branch** (never directly to `main`)
3. **Open a Pull Request (PR):**
   - PR must pass all CI checks (tests, lint, Codacy)
   - Request review from at least one other contributor
4. **Reviewers:**
   - Check for code clarity, standards, TSDoc, and test coverage
   - Request changes if standards are not met
5. **Merge:**
   - Only after all checks pass and reviews are approved

---

Following these standards ensures a healthy, maintainable, and collaborative codebase.

## TSDoc Format

Use [TSDoc](https://tsdoc.org/) syntax when writing TypeScript

Examples

````
export class Statistics {
  /**
   * Returns the average of two numbers.
   *
   * @remarks
   * This method is part of the {@link core-library#Statistics | Statistics subsystem}.
   *
   * @param x - The first input number
   * @param y - The second input number
   * @returns The arithmetic mean of `x` and `y`
   *
   * @beta
   */
  public static getAverage(x: number, y: number): number {
    return (x + y) / 2.0;
  }
}```

```
````
