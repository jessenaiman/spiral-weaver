# Ωmega Spiral - QWEN.md

## Project Overview

Ωmega Spiral is a classic RPG rooted in Final Fantasy-style turn-based combat, reimagined with a spiraling, player-driven twist. The game features a complex narrative architecture with a hierarchy of Story → Chapter → Arc → Moment → Scene, where "Crossing Threads" (nexus points) let collective choices shape each Spiral Turn, driving replayability and community engagement.

The project is built as a Next.js 15 application using TypeScript 5.x with a layered architecture that includes narrative domain models, Dreamweaver orchestration services, and React-based UI components. The application follows SOLID and DRY principles with a focus on generating dynamic narrative scenes through an AI-powered Dreamweaver system.

## Architecture

The application follows a layered architecture:

- **Domain Layer**: Contains the narrative hierarchy with Story, Chapter, Arc, and Moment classes
- **Application Services**: Includes ReferenceShelf, SceneAssembler, DreamweaverDirector for orchestrating narrative flow
- **Infrastructure**: File storage, telemetry, HTTP handlers, and React UI presenters
- **UI Layer**: Next.js React components using shadcn/ui and Tailwind CSS

The core narrative structure follows: `Story → Chapter → Arc → Moment`, with runtime `SceneDescriptor` objects assembled from moment data combined with active party, equipment, and chapter context.

## Building and Running

### Prerequisites
- Node.js ≥ 22.11
- pnpm package manager

### Setup Commands
```bash
pnpm install          # Install dependencies
```

### Running the Application
```bash
pnpm run dev          # Start development server with Turbopack on port 9002
pnpm run scene-desk   # Alternative command to run the Scene Desk UI (same as dev)
pnpm run build        # Build for production
pnpm run start        # Start production server
```

### Development Commands
```bash
pnpm run typecheck    # Run TypeScript type checking
pnpm run lint         # Run ESLint linter
pnpm run test         # Run Jest tests
pnpm run test:watch   # Run Jest in watch mode
pnpm run test:coverage # Run tests with coverage
pnpm run test:ci      # Run CI tests with coverage
pnpm run test:e2e     # Run Playwright end-to-end tests
```

### AI/Genkit Commands
```bash
pnpm run genkit:dev   # Start Genkit development server
pnpm run genkit:watch # Start Genkit with file watching
```

## Key Features

1. **Dreamweaver Scene Desk**: A React-based dashboard that allows operators to traverse the narrative hierarchy, generate scenes, and inspect diagnostics in real time.

2. **Narrative Generation**: AI-powered scene generation using Google AI models and Genkit framework.

3. **Shard System**: Players can collect "Shards of Omega" to unlock retro polish, orchestrated sound, and combat depth.

4. **Modular Architecture**: Clean separation between narrative domain and runtime execution.

## Development Conventions

- TypeScript 5.x with strict type checking
- ESLint with functional, import, and unicorn plugins
- Prettier for code formatting
- TDD approach with vitest for unit testing
- Component testing with React Testing Library
- UI components based on shadcn/ui library
- Tailwind CSS for styling with CSS variables
- Semantic commit messages following Conventional Commits

## Project Structure

```
├── src/
│   ├── ai/           # Genkit AI configuration and handlers
│   ├── app/          # Next.js app router pages
│   ├── components/   # React UI components
│   ├── hooks/        # React custom hooks
│   └── lib/          # Shared utilities and libraries
├── docs/             # Documentation files
├── prisma/           # Database schema and migrations
├── scripts/          # Build and utility scripts
├── tests/            # Test files
├── jest.config.js    # Jest testing configuration
├── next.config.ts    # Next.js configuration
├── tailwind.config.ts # Tailwind CSS configuration
└── package.json      # Project dependencies and scripts
```

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS with Tailwind CSS Animate
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Testing**: Jest, React Testing Library, Playwright
- **AI/ML**: Google AI integration via Genkit
- **Database**: Prisma ORM with likely SQLite/PostgreSQL
- **Build Tool**: Turbopack (for development)
- **Package Manager**: pnpm

## Narrative Architecture

The system follows a strict narrative hierarchy:
- **Story**: Top-level narrative containing multiple chapters
- **Chapter**: Contains arcs with context and metadata
- **Arc**: Story segments with themes, containing moments
- **Moment**: The lowest-level authored unit containing narrative beats
- **SceneDescriptor**: Runtime objects assembled from moment data and context

The Dreamweaver system orchestrates scene generation through:
- ReferenceShelf for quick lookups of authored content
- SceneAssembler for combining narrative elements
- RestrictionService for content validation
- MoodEngine for emotional tone management
- NarrativeJournal for tracking story progression