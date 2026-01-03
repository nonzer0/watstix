# CLAUDE.md - Watstix Codebase Guide for AI Assistants

## Project Overview

**Watstix** is a job application tracking system built with modern web technologies. It allows users to track job applications, manage their status (applied, interviewing, offered, rejected, accepted, withdrawn), and organize their job search process.

### Key Features
- User authentication via Supabase Auth
- Job application CRUD operations
- Status filtering and tracking
- Responsive UI with DaisyUI components
- Real-time data sync with Supabase

---

## Tech Stack

### Core Technologies
- **React 18.3.1** - UI library
- **TypeScript 5.5.3** - Type safety
- **Vite 7.2.6** - Build tool and dev server
- **pnpm 10.19.0** - Package manager (enforced via preinstall hook)

### State & Data
- **Zustand 5.0.8** - Global state management
- **Supabase 2.57.4** - Backend-as-a-Service (PostgreSQL + Auth + Storage)

### UI & Styling
- **Tailwind CSS 4.1.17** - Utility-first CSS framework
- **DaisyUI 5.5.8** - Tailwind component library
- **lucide-react 0.344.0** - Icon library

### Testing & Quality
- **Vitest 4.0.16** - Unit testing framework
- **Playwright 1.57.0** - Browser testing
- **Testing Library** - React component testing
- **Storybook 10.1.9** - Component development & visual testing
- **ESLint 9.9.1** - Code linting
- **Prettier 3.7.2** - Code formatting
- **Husky 9.1.7** - Git hooks
- **lint-staged 16.2.7** - Pre-commit linting

---

## Repository Structure

```
watstix/
├── .github/
│   └── workflows/
│       └── main-ci.yml          # CI/CD pipeline
├── .husky/
│   └── pre-commit               # Git pre-commit hook (runs lint-staged)
├── .storybook/                  # Storybook configuration
│   ├── main.ts
│   ├── preview.ts
│   └── vitest.setup.ts
├── supabase/
│   └── migrations/              # Database migrations
│       ├── 20251022233209_create_job_applications_table.sql
│       ├── 20251022233830_update_rls_policies_for_auth.sql
│       └── 20251128225142_add_job_posting_link_to_job_applications.sql
├── src/
│   ├── components/              # React components
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   ├── Header.spec.tsx
│   │   │   └── index.ts
│   │   ├── JobStatusBtn/
│   │   │   ├── JobStatusBtn.tsx
│   │   │   ├── JobStatusBtn.spec.tsx
│   │   │   └── index.ts
│   │   ├── AuthForm.tsx
│   │   ├── JobApplicationCard.tsx
│   │   ├── JobApplicationForm.tsx
│   │   └── Loading.tsx
│   ├── contexts/                # React contexts
│   │   └── AuthContext.tsx      # Authentication context & hooks
│   ├── lib/                     # External library integrations
│   │   └── supabase.ts          # Supabase client setup
│   ├── services/                # Business logic & API calls
│   │   ├── jobService.ts
│   │   ├── jobService.test.ts
│   │   └── index.ts
│   ├── store/                   # Zustand state management
│   │   ├── store.ts             # Global store with selectors
│   │   ├── store.test.ts
│   │   └── index.ts
│   ├── stories/                 # Storybook stories
│   │   └── Header.stories.tsx
│   ├── test/                    # Test configuration
│   │   └── setup.ts
│   ├── types/                   # TypeScript type definitions
│   │   └── types.ts
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # Application entry point
│   └── vite-env.d.ts
├── eslint.config.js             # ESLint configuration (flat config)
├── vite.config.ts               # Vite configuration
├── vitest.config.ts             # Vitest test configuration
├── tsconfig.json                # TypeScript base config
├── tsconfig.app.json            # TypeScript app config
├── tsconfig.node.json           # TypeScript node config
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

---

## Development Workflow

### Initial Setup

```bash
# Install dependencies (pnpm is required)
pnpm install

# Set up environment variables
# Create .env file with:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development Commands

```bash
# Start dev server (http://localhost:5173)
pnpm dev

# Run tests in watch mode
pnpm test

# Run tests once (CI mode)
pnpm test --run

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Build for production
pnpm build

# Preview production build
pnpm preview

# Start Storybook
pnpm storybook

# Build Storybook
pnpm build-storybook
```

### Git Workflow

1. **Pre-commit hook** automatically runs `lint-staged` which formats all changed files with Prettier
2. **Branch naming**: Use descriptive branch names (e.g., `feature/add-export`, `fix/status-filter`)
3. **Commit messages**: Follow conventional commits format
4. **CI/CD**: All PRs trigger the CI pipeline which:
   - Installs dependencies
   - Installs Playwright
   - Builds the project
   - Runs tests with coverage

---

## Architecture Patterns

### State Management (Zustand)

**Location**: `src/store/store.ts`

The app uses Zustand with a custom selector pattern for optimal re-renders:

```typescript
// Store definition with combine middleware
const useStoreBase = create(
  combine(
    { jobs: [] as JobApplication[] },
    (set) => ({
      setJobs: (jobs) => set({ jobs }),
      deleteJob: (id) => set((state) => ({ jobs: state.jobs.filter(...) })),
      updateJob: (id, updates) => set((state) => ({ jobs: state.jobs.map(...) })),
    })
  )
);

// Auto-generated selectors for granular subscriptions
export const useStore = createSelectors(useStoreBase);

// Usage in components
const jobs = useStore.use.jobs(); // Only re-renders when jobs change
const setJobs = useStore.use.setJobs();
```

**Key principles**:
- State is centralized in Zustand store
- Selectors auto-generated via `createSelectors` utility
- Store actions handle validation (warn if job doesn't exist before update/delete)

### Service Layer

**Location**: `src/services/`

Services encapsulate all Supabase API calls and business logic:

```typescript
// Example: jobService.ts
export const jobService = {
  getJobs: async (): Promise<JobApplication[]> => { /* ... */ },
  getJobById: async (id: string): Promise<JobApplication | null> => { /* ... */ },
  deleteJobById: async (id: string): Promise<boolean> => { /* ... */ },
};
```

**Guidelines**:
- Keep Supabase calls isolated in services
- Return typed promises
- Handle errors gracefully with try/catch
- Log errors to console

### Component Structure

**Organization**:
- Complex components get their own folder with `index.ts`, component file, test file, and optional stories
- Simple components can be single files
- Always export from `index.ts` for clean imports

**Example** (`src/components/Header/`):
```
Header/
├── index.ts              # Re-exports Header
├── Header.tsx            # Component implementation
├── Header.spec.tsx       # Unit tests
└── Header.stories.tsx    # Storybook stories (in src/stories/)
```

**Component patterns**:
- Use function components with TypeScript
- Props interfaces defined inline or at top of file
- Destructure props in function signature
- Use named exports for components

### Context Pattern (Authentication)

**Location**: `src/contexts/AuthContext.tsx`

```typescript
// Provides auth state and methods throughout app
export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  // ... auth logic
  return (
    <AuthContext.Provider value={{ user, signIn, signOut, ... }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for consuming auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
```

---

## Code Conventions

### TypeScript

- **Strict mode enabled** via `tsconfig.json`
- **Type inference preferred** over explicit types where possible
- **Define types in `src/types/types.ts`** for shared types
- **Export types alongside code** for component-specific types

**Type definitions**:
```typescript
// Central types (src/types/types.ts)
export type Status = "applied" | "interviewing" | "offered" | "rejected" | "accepted" | "withdrawn";
export type JobApplication = { /* ... */ };

// Component-local types
interface StatusGridProps {
  status: { label: string; value: StatusFilter; color: string };
  // ...
}
```

### React Patterns

**Hooks**:
- Use `useCallback` for functions passed to child components or used in dependencies
- Use `useEffect` for side effects (data fetching, subscriptions)
- Custom hooks start with `use` (e.g., `useAuth`)

**Component organization**:
```typescript
// 1. Imports
import { useCallback, useState } from "react";

// 2. Types/Interfaces
interface Props { /* ... */ }

// 3. Component
export function MyComponent({ prop1, prop2 }: Props) {
  // 4. Hooks
  const [state, setState] = useState();

  // 5. Callbacks/handlers
  const handleClick = useCallback(() => {}, []);

  // 6. Effects
  useEffect(() => {}, []);

  // 7. Early returns
  if (loading) return <Loading />;

  // 8. JSX
  return <div>...</div>;
}
```

### Styling

- **Tailwind utility classes** for all styling
- **DaisyUI components** for common UI patterns (buttons, cards, etc.)
- **Responsive design**: Use Tailwind breakpoints (`sm:`, `md:`, `lg:`)
- **Color scheme**:
  - Applied: `bg-blue-600`
  - Interviewing: `bg-yellow-600`
  - Offered: `bg-green-600`
  - Rejected: `bg-red-600`
  - Accepted: `bg-emerald-600`
  - Withdrawn: `bg-gray-500`

### ESLint & Prettier

**ESLint config** (`eslint.config.js`):
- Flat config format (ESLint 9+)
- TypeScript ESLint integration
- React hooks rules enforced
- React refresh warnings
- Storybook plugin enabled

**Prettier**:
- Default configuration (empty `.prettierrc`)
- Runs automatically on pre-commit via lint-staged
- Formats all file types (see `lint-staged` in `package.json`)

---

## Testing Strategy

### Unit Tests (Vitest)

**Location**: `*.test.ts` or `*.spec.tsx` files

**Configuration**: `vitest.config.ts`
- Project: "unit"
- Environment: jsdom
- Setup: `src/test/setup.ts` (imports `@testing-library/jest-dom/vitest`)

**Running tests**:
```bash
pnpm test              # Watch mode
pnpm test --run        # Run once (CI)
```

**Example** (`src/store/store.test.ts`):
```typescript
import { describe, it, expect } from 'vitest';
import { useStore } from './store';

describe('Store', () => {
  it('should update jobs', () => {
    const { setJobs, jobs } = useStore.getState();
    setJobs([mockJob]);
    expect(jobs).toHaveLength(1);
  });
});
```

### Component Tests (Testing Library)

**Example** (`src/components/Header/Header.spec.tsx`):
```typescript
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

it('renders header', () => {
  render(<Header setShowForm={vi.fn()} signOut={vi.fn()} />);
  expect(screen.getByText('Watstix')).toBeInTheDocument();
});
```

### Storybook Tests

**Configuration**: `.storybook/main.ts`
- Project: "storybook"
- Browser testing with Playwright
- Addons: Vitest, A11y, Docs, Chromatic

**Running Storybook**:
```bash
pnpm storybook         # Dev mode
pnpm build-storybook   # Build static
```

**Stories pattern** (`src/stories/Header.stories.tsx`):
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Header } from '../components/Header';

const meta: Meta<typeof Header> = {
  component: Header,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {
    setShowForm: () => {},
    signOut: async () => {},
  },
};
```

---

## Database & Backend (Supabase)

### Setup

**Client initialization** (`src/lib/supabase.ts`):
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Database Schema

**Table**: `job_applications`

Columns:
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users)
- `company_name` (text)
- `position_title` (text)
- `job_description` (text, optional)
- `job_posting_link` (text, optional)
- `location` (text, optional)
- `salary_range` (text, optional)
- `application_date` (date)
- `status` (text: applied|interviewing|offered|rejected|accepted|withdrawn)
- `contact_person` (text, optional)
- `contact_email` (text, optional)
- `notes` (text, optional)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Migrations

**Location**: `supabase/migrations/`

**Key migrations**:
1. `20251022233209_create_job_applications_table.sql` - Initial table creation
2. `20251022233830_update_rls_policies_for_auth.sql` - Row Level Security policies
3. `20251128225142_add_job_posting_link_to_job_applications.sql` - Added job_posting_link column

**RLS Policies**: User can only access their own job applications (filtered by `user_id`)

---

## CI/CD Pipeline

**File**: `.github/workflows/main-ci.yml`

**Triggers**:
- Push to `main` branch
- Pull requests to any branch

**Jobs**:
1. **Checkout code**
2. **Setup pnpm** (action-setup@v4)
3. **Setup Node.js** (from `.node-version` file)
4. **Install dependencies** (`pnpm install`)
5. **Install Playwright** (`pnpm exec playwright install chromium`)
6. **Build** (`pnpm run build`)
7. **Test & Coverage** (`pnpm run test --run`)

**Requirements for PRs**:
- All CI checks must pass
- Build must succeed
- Tests must pass
- No TypeScript errors

---

## AI Assistant Guidelines

### When Making Changes

1. **Always read files before editing**
   - Use `Read` tool to understand current implementation
   - Check related files for patterns and conventions

2. **Type safety first**
   - Run `pnpm typecheck` after changes
   - Ensure all types are properly defined
   - Don't use `any` unless absolutely necessary

3. **Test your changes**
   - Add/update tests for new functionality
   - Run `pnpm test --run` to verify all tests pass
   - Consider adding Storybook stories for new components

4. **Follow existing patterns**
   - Component structure: Use folder structure for complex components
   - State management: Use Zustand store with selectors
   - Services: Keep Supabase calls in service layer
   - Styling: Use Tailwind classes, maintain responsive design

5. **Formatting & linting**
   - Pre-commit hook handles Prettier formatting automatically
   - Run `pnpm lint` to check for ESLint issues
   - Fix any linting errors before committing

### Common Tasks

#### Adding a new component

1. Create folder in `src/components/ComponentName/`
2. Create `ComponentName.tsx` with TypeScript types
3. Create `index.ts` to re-export component
4. Create `ComponentName.spec.tsx` for tests
5. (Optional) Create story in `src/stories/`

#### Adding a new service method

1. Add method to appropriate service (e.g., `jobService.ts`)
2. Define return type
3. Add error handling with try/catch
4. Write unit test in corresponding `.test.ts` file

#### Modifying database schema

1. Create new migration in `supabase/migrations/`
2. Use timestamp naming: `YYYYMMDDHHMMSS_description.sql`
3. Update TypeScript types in `src/types/types.ts` and `src/lib/supabase.ts`
4. Update RLS policies if needed

#### Adding Zustand state

1. Add state property to `combine` initial state
2. Add action methods in the `set` callback
3. Include validation/error handling
4. Selectors auto-generated via `createSelectors`

### File References

When referencing code locations, use the format `file_path:line_number`:
- Example: `src/App.tsx:27` (the fetchApplications function)
- Example: `src/store/store.ts:18` (the deleteJob action)

### Environment Variables

Required environment variables (create `.env` file):
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Dependencies

- **Never commit `node_modules/`** (in `.gitignore`)
- **Use pnpm** - `preinstall` script enforces this
- **Lock file**: `pnpm-lock.yaml` should be committed
- **Adding dependencies**: `pnpm add package-name`
- **Adding dev dependencies**: `pnpm add -D package-name`

### Common Pitfalls

1. **Supabase client**: Always import from `src/lib/supabase.ts`, not directly from package
2. **Environment variables**: Prefix with `VITE_` for client-side access
3. **Zustand selectors**: Use `useStore.use.propertyName()` pattern for granular subscriptions
4. **Component exports**: Export from `index.ts` for clean imports
5. **Type definitions**: Keep `JobApplication` type in sync between `types.ts` and `lib/supabase.ts`

### Best Practices

- **Components**: Keep them focused and single-responsibility
- **Hooks**: Extract reusable logic into custom hooks
- **Error handling**: Always handle errors gracefully, log to console
- **Loading states**: Show loading UI during async operations
- **Accessibility**: Consider keyboard navigation and screen readers
- **Responsive design**: Test on multiple screen sizes
- **Performance**: Use `useCallback` and `useMemo` when appropriate
- **Code organization**: Group related functionality together

---

## Quick Reference

### Project Commands
```bash
pnpm dev           # Start dev server
pnpm build         # Production build
pnpm test          # Run tests (watch)
pnpm typecheck     # Check TypeScript
pnpm lint          # Check linting
pnpm storybook     # Start Storybook
```

### Key Files
- `src/App.tsx` - Main application component
- `src/store/store.ts` - Zustand state management
- `src/lib/supabase.ts` - Supabase client
- `src/types/types.ts` - Shared TypeScript types
- `src/contexts/AuthContext.tsx` - Authentication
- `eslint.config.js` - Linting rules
- `vitest.config.ts` - Test configuration

### Useful Patterns
```typescript
// Zustand selector
const jobs = useStore.use.jobs();

// Auth hook
const { user, signIn, signOut } = useAuth();

// Service call
const jobs = await jobService.getJobs();

// Component with types
export function MyComponent({ prop }: { prop: string }) { }
```

---

**Last Updated**: January 3, 2026
**Project Version**: 0.0.0 (as per package.json)
