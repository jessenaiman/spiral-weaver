# AGENTS Guidelines for This Repository


## 1. Use the Development Server, **not** `npm run build`

* **Always use `pnpm dev`** while iterating on the application.
* **Do _not_ run `pnpm run build` inside the agent session.**  Running the production
  build command switches the `.next` folder to production assets which disables hot
  reload and can leave the development server in an inconsistent state.  If a
  production build is required, do it outside of the interactive agent workflow.

## 2. Keep Dependencies in Sync

If you add or update dependencies remember to:

0. Always install using the terminal installation.
1. Update the appropriate lockfile  `pnpm-lock.yaml`.
2. Re-start the development server so that it picks up the changes.

## 3. Coding Conventions

* Prefer TypeScript (`.tsx`/`.ts`) for new components and utilities.
* Co-locate component-specific styles in the same folder as the component when
  practical.

## 4. Useful Commands Recap

| Command            | Purpose                                            |
| ------------------ | -------------------------------------------------- |
| `pnpm run dev`      | Start the Next.js dev server with HMR.             |
| `pnpm run lint`     | Run ESLint checks.                                 |
| `pnpm run test`     | Execute the test suite (if present).               |
| `pnpm run build`    | **Production build – _do not run during agent sessions_** |

---

Following these practices ensures that the agent-assisted development workflow stays
fast and dependable.  When in doubt, restart the dev server rather than running the
production build.