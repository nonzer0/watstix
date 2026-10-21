# CLAUDE.md - Watstix Codebase Guide for AI Assistants

## Project Overview

**Watstix** is a job application tracking system built with modern web technologies. It allows users to track job applications, manage their status (applied, interviewing, offered, rejected, accepted, withdrawn), and organize their job search process.

### Key Features

- User authentication via Supabase Auth
- Job application CRUD operations with detailed tracking
- Interview phase management (custom phases per job)
- Status filtering and tracking (applied, interviewing, offered, rejected, accepted, withdrawn)
- Multi-page routing with React Router
- Dense, keyboard-first UI: sortable applications table, ⌘K command palette, single-key shortcuts
- Light and dark themes (system preference or explicit choice)
- Responsive UI with CSS Modules and CSS custom properties
- Real-time data sync with Supabase

---

## Tech Stack

### Core Technologies

- **React 18.3.1** - UI library
- **TypeScript 5.5.3** - Type safety
- **Vite 7.2.6** - Build tool and dev server
- **pnpm 11.0.1** - Package manager (enforced via preinstall hook)

### State & Data

- **Zustand 5.0.8** - Global state management
- **Supabase 2.57.4** - Backend-as-a-Service (PostgreSQL + Auth + Storage)
- **React Router 7.11.0** - Client-side routing

### UI & Styling

- **lucide-react 0.344.0** - Icon library
- **Geist / Geist Mono** (`@fontsource-variable/*`) - UI and tabular-numeral fonts

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
│       ├── 20251128225142_add_job_posting_link_to_job_applications.sql
│       └── 20251226230616_create_interview_phases_table.sql
├── src/
│   ├── index.css                # Minimal CSS reset
│   ├── tokens.css               # Design tokens (CSS custom properties / vars)
│   ├── typography.css           # Global element styles & utility classes
│   ├── components/              # Reusable UI components (single files)
│   │   ├── AppShell.tsx             # Top bar, command palette, global hotkeys
│   │   ├── AuthForm.tsx
│   │   ├── CommandPalette.tsx       # ⌘K palette (fuzzy search over commands)
│   │   ├── ConfirmDialog.tsx        # Host for useConfirm()
│   │   ├── Dialog.tsx               # Native <dialog> wrapper
│   │   ├── ForgotPasswordModal.tsx
│   │   ├── InterviewPhaseCard.tsx   # Timeline node for one phase
│   │   ├── InterviewPhaseForm.tsx
│   │   ├── InterviewPhaseTimeline.tsx
│   │   ├── JobApplicationForm.tsx
│   │   ├── JobRow.tsx / JobTable.tsx  # Applications table
│   │   ├── Loading.tsx
│   │   ├── Logo.tsx
│   │   ├── ShortcutsDialog.tsx
│   │   ├── StatusFilterBar.tsx
│   │   ├── StatusIcon.tsx           # Per-status glyph
│   │   ├── StatusMenu.tsx           # Keyboard-navigable status picker
│   │   ├── ThemeToggle.tsx
│   │   ├── Toaster.tsx
│   │   └── *.module.css / *.spec.tsx alongside each
│   ├── views/                   # Route/page components
│   │   ├── Dashboard.tsx        # Applications table (/ route)
│   │   ├── JobDetail.tsx        # Job detail page (/job/:id route)
│   │   └── ResetPassword.tsx    # Password reset (/reset-password route)
│   ├── contexts/                # React contexts
│   │   └── AuthContext.tsx      # Authentication context & hooks
│   ├── hooks/                   # Custom hooks
│   │   ├── useHotkeys.ts        # Page-level keyboard shortcuts
│   │   ├── useJobActions.ts     # Shared delete / status-change behaviour
│   │   └── useModalDialog.ts    # showModal + focus management
│   ├── lib/                     # External library integrations
│   │   └── supabase.ts          # Supabase client setup
│   ├── services/                # Business logic & API calls
│   │   ├── interviewPhaseService.ts
│   │   ├── jobPostingService.ts
│   │   ├── jobService.ts
│   │   └── index.ts
│   ├── store/                   # Zustand state management
│   │   ├── store.ts             # Jobs / phases store + createSelectors
│   │   ├── confirmStore.ts      # useConfirm() requests
│   │   ├── themeStore.ts        # Theme preference
│   │   ├── toastStore.ts        # Toast queue
│   │   └── index.ts
│   ├── stories/                 # Storybook stories (+ fixtures.ts, storyProviders.tsx)
│   ├── utils/                   # Pure helpers (each with a .test.ts)
│   │   ├── commandSearch.ts     # Fuzzy ranking for the palette
│   │   ├── format.ts            # Date formatting (date-only strings parsed as local)
│   │   ├── jobFilters.ts        # Filter / search / sort / counts
│   │   ├── keyboard.ts          # Editable-target check, ⌘↵ submit
│   │   ├── outcome.ts           # Interview outcome labels
│   │   ├── status.ts            # Status order, labels, open/closed
│   │   ├── theme.ts             # Theme preference persistence
│   │   └── url.ts               # safeExternalUrl / mailtoHref
│   ├── test/                    # Test configuration
│   │   └── setup.ts
│   ├── types/                   # TypeScript type definitions
│   │   └── types.ts
│   ├── App.tsx                  # Router configuration
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

### Routing (React Router)

**Location**: `src/App.tsx`, `src/main.tsx`, `src/views/`

The app uses React Router for client-side navigation:

```typescript
// main.tsx - Wrap app with BrowserRouter
<BrowserRouter>
  <App />
</BrowserRouter>

// App.tsx - Define routes
<Routes>
  <Route path="/reset-password" element={<ResetPassword />} />
  <Route path="/" element={<Dashboard />} />
  <Route path="/job/:id" element={<JobDetail />} />
</Routes>

// Navigation from components
const navigate = useNavigate();
navigate(`/job/${jobId}`);
```

**Routes**:

- `/` - Dashboard with job cards and filtering
- `/job/:id` - Job detail page with interview phases
- `/reset-password` - Password reset (public, linked from Supabase reset email)

**Key principles**:

- Route components live in `src/views/` folder
- Reusable UI components live in `src/components/`
- Use `useNavigate()` for programmatic navigation
- Use `useParams()` to access route parameters

### State Management (Zustand)

**Location**: `src/store/store.ts`

The app uses Zustand with a custom selector pattern for optimal re-renders:

```typescript
// Store definition with combine middleware
const useStoreBase = create(
  combine(
    {
      jobs: [] as JobApplication[],
      interviewPhases: [] as InterviewPhase[]
    },
    (set) => ({
      // Job actions
      setJobs: (jobs) => set({ jobs }),
      deleteJob: (id) => set((state) => ({ jobs: state.jobs.filter(...) })),
      updateJob: (id, updates) => set((state) => ({ jobs: state.jobs.map(...) })),

      // Interview phase actions
      setInterviewPhases: (phases) => set({ interviewPhases: phases }),
      addInterviewPhase: (phase) => set((state) => ({ interviewPhases: [...state.interviewPhases, phase] })),
      updateInterviewPhase: (id, updates) => set((state) => ({ interviewPhases: state.interviewPhases.map(...) })),
      deleteInterviewPhase: (id) => set((state) => ({ interviewPhases: state.interviewPhases.filter(...) })),
    })
  )
);

// Auto-generated selectors for granular subscriptions
export const useStore = createSelectors(useStoreBase);

// Usage in components
const jobs = useStore.use.jobs(); // Only re-renders when jobs change
const phases = useStore.use.interviewPhases();
const setJobs = useStore.use.setJobs();
```

**Key principles**:

- State is centralized in Zustand store
- Selectors auto-generated via `createSelectors` utility
- Store actions handle validation (warn if entity doesn't exist before update/delete)
- Separate state for jobs and interview phases

### Service Layer

**Location**: `src/services/`

Services encapsulate all Supabase API calls and business logic:

```typescript
// jobService.ts
export const jobService = {
  getJobs: async (): Promise<JobApplication[]> => {
    /* ... */
  },
  getJobById: async (id: string): Promise<JobApplication | null> => {
    /* ... */
  },
  deleteJobById: async (id: string): Promise<boolean> => {
    /* ... */
  },
};

// interviewPhaseService.ts
export const interviewPhaseService = {
  getPhasesByJobId: async (jobId: string): Promise<InterviewPhase[]> => {
    /* ... */
  },
  createPhase: async (
    phase: Partial<InterviewPhase>
  ): Promise<InterviewPhase | null> => {
    /* ... */
  },
  updatePhase: async (
    id: string,
    updates: Partial<InterviewPhase>
  ): Promise<boolean> => {
    /* ... */
  },
  deletePhase: async (id: string): Promise<boolean> => {
    /* ... */
  },
  reorderPhases: async (
    jobId: string,
    phaseIds: string[]
  ): Promise<boolean> => {
    /* ... */
  },
};
```

**Guidelines**:

- Keep Supabase calls isolated in services
- Return typed promises
- Handle errors gracefully with try/catch
- Log errors to console
- Use `.select().single()` pattern when inserting to get back the created record with auto-generated fields

### Component Structure

**Organization**:

- **Route components** go in `src/views/` folder (Dashboard.tsx, JobDetail.tsx, ResetPassword.tsx)
- **Reusable UI components** go in `src/components/` folder
- **Avoid separate folders for components** - Keep components as single files
- **Do NOT use barrel files** (`index.ts`) for components - Import components directly from their files
- Only use folders when a component has multiple related files that are tightly coupled
- Co-locate test files next to components with matching names
- **Note**: Services (`src/services/`) and stores (`src/store/`) may use barrel files for cleaner exports

See the repository structure above for the current component list.

**Why avoid folders and barrel files?**

- Simpler file structure and navigation
- Reduces boilerplate and maintenance overhead
- Direct imports are more explicit and easier to trace
- Eliminates issues with circular dependencies
- Faster builds (no extra re-export layers)

**Component patterns**:

- Use function components with TypeScript
- Props interfaces defined inline or at top of file
- Destructure props in function signature
- Use named exports for components
- Keep components focused on UI - extract business logic to separate `.ts` files

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
export type Status =
  | 'applied'
  | 'interviewing'
  | 'offered'
  | 'rejected'
  | 'accepted'
  | 'withdrawn';
export type JobApplication = {
  /* ... */
};
export type InterviewPhase = {
  id: string;
  user_id: string;
  job_application_id: string;
  title: string;
  description?: string;
  interview_date?: string;
  interviewer_names: string[];
  notes?: string;
  outcome?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// Component-local types
interface StatusGridProps {
  status: { label: string; value: StatusFilter; color: string };
  // ...
}
```

### React Patterns

**Separation of Concerns**:

- **Extract non-trivial logic from component files** - Move business logic to separate `.ts` files
- Keep components focused on presentation and user interaction
- Complex calculations, data transformations, and utilities belong in plain TypeScript files
- Place utility functions in `src/utils/` directory (create if needed)
- This improves testability, reusability, and maintainability

**Examples**:

```typescript
// ❌ Bad: Complex logic inline in component
export function JobList({ jobs }: Props) {
  const filtered = jobs
    .filter((j) => j.status !== 'rejected')
    .map((j) => ({
      ...j,
      formatted: `${j.company_name} - ${j.position_title}`,
    }))
    .sort(
      (a, b) =>
        new Date(b.application_date).getTime() -
        new Date(a.application_date).getTime()
    );
  // ...
}

// ✅ Good: Logic extracted to utility file
// src/utils/jobHelpers.ts
export function filterAndFormatJobs(jobs: JobApplication[]) {
  return jobs
    .filter((j) => j.status !== 'rejected')
    .map(formatJobDisplay)
    .sort(sortByApplicationDate);
}

// JobList.tsx
import { filterAndFormatJobs } from '../utils/jobHelpers';

export function JobList({ jobs }: Props) {
  const displayJobs = filterAndFormatJobs(jobs);
  // ...
}
```

**Hooks**:

- Use `useCallback` for functions passed to child components or used in dependencies
- Use `useEffect` for side effects (data fetching, subscriptions)
- Custom hooks start with `use` (e.g., `useAuth`)
- Extract complex logic into custom hooks when it involves React state/effects

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

The project uses CSS Modules + CSS custom properties (design tokens). No Tailwind or DaisyUI — both have been fully removed.

**Visual direction**: a dense, keyboard-first tool (Linear-like). Neutral slate greys, one accent (used for focus, links and the active row), near-black primary buttons, hairline borders instead of cards and shadows, Geist for UI text and Geist Mono for numerals (dates, counts, salaries). Shadows are reserved for overlays. Status is shown with `StatusIcon` glyphs, not coloured pills.

**CSS architecture** (`src/main.tsx` imports the Geist fonts, then in order):

1. **`src/index.css`** — Reset; body font, size, colour and background from tokens.

2. **`src/tokens.css`** — All design tokens as CSS custom properties on `:root`. Use these for all styling — no raw values:
   - **Layout**: `--layout-narrow`, `--layout-wide`, `--topbar-height`, `--row-height`
   - **Spacing**: `--space-2xs` … `--space-xl`
   - **Border radius**: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`
   - **Icon sizes**: `--icon-xs` … `--icon-xl`
   - **Typography**: `--font-sans`, `--font-mono`, `--font-size-2xs` … `--font-size-xl`, `--font-weight-{normal,medium,bold}`
   - **Neutral scale**: `--gray-1` … `--gray-12` (Radix slate steps)
   - **Semantic**: `--bg`, `--bg-subtle`, `--bg-hover`, `--bg-active`, `--surface`, `--border`, `--border-strong`, `--text`, `--text-muted`, `--text-faint`, `--accent`, `--accent-hover`, `--accent-subtle`, `--accent-text`, `--focus-ring`, `--primary-bg`, `--primary-bg-hover`, `--primary-text`, `--danger`, `--danger-solid`, `--danger-subtle`, `--danger-text`, `--success`, `--success-subtle`, `--success-text`, `--overlay`
   - **Status / outcome**: `--status-{applied,interviewing,offered,accepted,rejected,withdrawn}`, `--outcome-{pending,passed,failed,cancelled}` — for glyphs and dots; use the `*-text` tokens for text
   - **Shadows**: `--shadow-popover`, `--shadow-dialog`
   - **Motion**: `--duration-fast`, `--duration-normal`

3. **`src/typography.css`** — Global element styles and reusable utility classes:
   - Styles bare elements: `h1`–`h4`, `p`, `a`, `form`, `label`, `input`, `textarea`, `select`, `fieldset`, `legend`, `:focus-visible`
   - Buttons: `.btn` (= `.btn-secondary`), `.btn-primary`, `.btn-ghost`, `.btn-danger`, size modifiers `.btn-sm`, `.btn-icon`; `.link-button`
   - Other utilities: `.kbd`, `.mono`, `.muted`, `.visually-hidden`, `.error`, `.alert-success`, `.spinner`, `.spinner-sm`, `.input-with-icon`, `.field-grid`, `.form-footer`, `.form-hint`

**CSS Modules** — Component-specific styles use `ComponentName.module.css` co-located with their component. Import as `styles` and apply via `className={styles.className}`. Global classes referenced inside a module must be wrapped: `:global(.kbd)`; a bare `.kbd` is hashed and will not match.

**Approach for new components**:

- Use tokens from `tokens.css` for spacing, sizing, color, etc.
- Use global classes from `typography.css` for common patterns before writing new CSS
- Put component-specific styles in a `.module.css` file
- Text colours must meet 4.5:1 in both themes; Storybook's a11y check enforces this
- No Tailwind utility classes

### Theming (light / dark)

- Dark values live in `tokens.css` twice: under `@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) }` and under `:root[data-theme='dark']`. Keep the two blocks identical.
- Components never branch on theme; they only reference semantic tokens.
- The preference (`system` | `light` | `dark`) lives in `src/store/themeStore.ts`, is persisted by `src/utils/theme.ts` (localStorage, wrapped in try/catch), and is applied as `data-theme` on `<html>` before first render in `main.tsx`. `system` removes the attribute.

### Dialogs, confirmations and toasts

- Use `Dialog.tsx` (native `<dialog>`) for every modal. Mark the field to focus with `data-autofocus`, not React `autoFocus` (focus fails while the dialog is still closed).
- Never call `window.confirm` / `alert`. Use `const confirm = useConfirm(); if (await confirm({...}))` and `useToastStore.use.showToast(message, tone)`.

### Keyboard shortcuts

- `useHotkeys({ key: handler })` in `src/hooks/useHotkeys.ts`. Plain keys are ignored in editable fields and while any modal dialog is open; `mod+k` style combos are not.
- Global shortcuts (⌘K, `?`, `N`) live in `AppShell`; page shortcuts live in the view. Keep `ShortcutsDialog.tsx` in sync when adding one.

---

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

**Naming Convention**:

- Use `.test.ts` for pure TypeScript/logic tests (services, utilities, stores)
- Use `.spec.tsx` for React component tests
- This convention helps distinguish between unit tests and component tests at a glance

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

**Example** (`src/components/AppShell.spec.tsx`):

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppShell from './AppShell';

vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ signOut }) }));

it('calls onNew from the New button', () => {
  const onNew = vi.fn();
  render(
    <MemoryRouter>
      <AppShell onNew={onNew}>content</AppShell>
    </MemoryRouter>
  );
  fireEvent.click(screen.getByRole('button', { name: /new/i }));
  expect(onNew).toHaveBeenCalled();
});
```

Shared fixtures: `makeJob()` in `src/test/fixtures.ts`.

### Storybook Tests

**Configuration**: `.storybook/main.ts`, `.storybook/preview.ts`

- Framework: React + Vite; stories run as tests in Chromium via the Vitest addon (`pnpm test --run` includes them)
- **A11y is enforced** (`a11y.test: 'error'`): any axe violation fails the story test
- A **Theme** toolbar global (system / light / dark) sets `data-theme`
- Services are module-mocked with `sb.mock(...)` in `preview.ts`, so page-level stories render real views. Set return values in `beforeEach` with `mocked(jobService.getJobs).mockResolvedValue(...)`
- `src/stories/storyProviders.tsx` provides `withAppProviders(path, initialEntry)` (router, mock auth, confirm/toast hosts); `src/stories/fixtures.ts` has sample jobs and phases

**Running Storybook**:

```bash
pnpm storybook         # Dev mode
pnpm build-storybook   # Build static
```

**Stories pattern** (`src/stories/Dashboard.stories.tsx`):

```typescript
const meta = {
  title: 'Views/Dashboard',
  component: Dashboard,
  parameters: { layout: 'fullscreen' },
  decorators: [withAppProviders('/')],
  beforeEach: () => {
    mocked(jobService.getJobs).mockResolvedValue(sampleJobs);
  },
} satisfies Meta<typeof Dashboard>;
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

**Table**: `interview_phases`

Columns:

- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users, CASCADE delete)
- `job_application_id` (uuid, references job_applications, CASCADE delete)
- `title` (text, required) - Name/title of the interview phase
- `description` (text, optional) - Additional details about the phase
- `interview_date` (timestamptz, optional) - When the interview happened or is scheduled
- `interviewer_names` (text[], array) - Array of interviewer names
- `notes` (text, optional) - Notes and feedback from the interview
- `outcome` (text, optional) - Result: pending, passed, failed, cancelled, etc.
- `sort_order` (integer, required) - Order of phases within a job application
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Relationships**:

- `interview_phases.job_application_id` → `job_applications.id` (CASCADE delete)
- When a job application is deleted, all its interview phases are automatically deleted

### Migrations

**Location**: `supabase/migrations/`

**Key migrations**:

1. `20251022233209_create_job_applications_table.sql` - Initial table creation
2. `20251022233830_update_rls_policies_for_auth.sql` - Row Level Security policies
3. `20251128225142_add_job_posting_link_to_job_applications.sql` - Added `job_posting_link` column
4. `20251226230616_create_interview_phases_table.sql` - Created interview_phases table with RLS

**RLS Policies**:

- Users can only access their own job applications (filtered by `user_id`)
- Users can only access their own interview phases (filtered by `user_id`)
- Both tables use the same RLS pattern: SELECT, INSERT, UPDATE, DELETE policies for authenticated users

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

## Security Considerations

Security is a **critical priority** for this application. All code changes must consider security implications.

### Key Security Principles

1. **Input Validation & Sanitization**
   - Validate all user inputs on the client side
   - Never trust client-side validation alone (Supabase RLS provides server-side protection)
   - Sanitize data before displaying to prevent XSS attacks
   - Use TypeScript types to enforce data structure, but don't rely on them for security

2. **Authentication & Authorization**
   - Always check user authentication status before displaying sensitive data
   - Use Supabase Auth for all authentication operations
   - Never store sensitive tokens in localStorage (Supabase handles this securely)
   - Verify user session on protected routes/operations

3. **Row Level Security (RLS)**
   - **Critical**: All database tables MUST have RLS policies enabled
   - Users should only access their own data (enforced via `user_id` in RLS policies)
   - Review RLS policies when adding new tables or columns
   - Test RLS policies with multiple user accounts

4. **SQL Injection Prevention**
   - Use Supabase client methods (never build raw SQL queries)
   - Supabase automatically parameterizes queries to prevent SQL injection
   - When filtering/querying, use the Supabase query builder methods (`.eq()`, `.filter()`, etc.)

5. **Cross-Site Scripting (XSS) Prevention**
   - React automatically escapes values in JSX, but be cautious with:
     - `dangerouslySetInnerHTML` (avoid unless absolutely necessary)
     - User-generated URLs (validate/sanitize before using in `href`)
     - Direct DOM manipulation
   - Sanitize user inputs that might be rendered as HTML

6. **Environment Variables & Secrets**
   - **NEVER commit `.env` files** to version control
   - Only use `VITE_` prefix for public environment variables
   - Keep `SUPABASE_ANON_KEY` public-safe (it's designed to be public)
   - Never expose service role keys or private API keys in client code
   - Rotate keys if accidentally exposed

7. **Dependency Security**
   - Keep dependencies up to date with `pnpm update`
   - Review security advisories with `pnpm audit`
   - Only install packages from trusted sources
   - Review package permissions and access

8. **Common Vulnerabilities to Avoid**
   - **Open Redirects**: Validate redirect URLs before using
   - **CSRF**: Supabase Auth handles CSRF protection
   - **Clickjacking**: Consider X-Frame-Options headers (if embedding)
   - **Information Disclosure**: Don't expose stack traces or detailed errors to users
   - **Insecure Direct Object References**: Always verify user owns the resource

### Security Checklist for Changes

Before committing code, verify:

- [ ] All user inputs are validated
- [ ] No sensitive data is logged to console in production
- [ ] Database queries use parameterized methods (Supabase client)
- [ ] RLS policies protect new tables/columns
- [ ] Authentication is checked for protected operations
- [ ] No secrets or API keys are hardcoded
- [ ] Dependencies are from trusted sources
- [ ] Error messages don't leak sensitive information

### Reporting Security Issues

If you discover a security vulnerability:

1. Do NOT commit the fix to a public branch immediately
2. Document the issue privately
3. Notify the project maintainers
4. Wait for coordinated disclosure before making public

---

## AI Assistant Guidelines

### When Making Changes

1. **Always read files before editing**
   - Use `Read` tool to understand current implementation
   - Check related files for patterns and conventions

2. **Security first**
   - Review the Security Considerations section before making changes
   - Validate all user inputs
   - Ensure RLS policies protect new database operations
   - Never commit secrets or API keys
   - Consider security implications of every change

3. **Type safety**
   - Run `pnpm typecheck` after changes
   - Ensure all types are properly defined
   - Don't use `any` unless absolutely necessary

4. **Test your changes**
   - Add/update tests for new functionality
   - Run `pnpm test --run` to verify all tests pass
   - Consider adding Storybook stories for new components
   - Use `.test.ts` for logic tests, `.spec.tsx` for component tests

5. **Follow existing patterns**
   - Component structure: Single file components, avoid folders and barrel files
   - State management: Use Zustand store with selectors
   - Services: Keep Supabase calls in service layer
   - Styling: Use CSS tokens and CSS Modules, maintain responsive design

6. **Formatting & linting**
   - Pre-commit hook handles Prettier formatting automatically
   - Run `pnpm lint` to check for ESLint issues
   - Fix any linting errors before committing

### Common Tasks

#### Adding a new route/view

1. Create `ViewName.tsx` in `src/views/`
2. Add TypeScript types and implement component with default export
3. Add route in `src/App.tsx`:
   ```typescript
   <Route path="/your-route" element={<ViewName />} />
   ```
4. Navigate to it: `navigate('/your-route')`
5. (Optional) Add tests

#### Adding a new component

1. Create `ComponentName.tsx` in `src/components/`
2. Add TypeScript types and implement component with default export
3. Create `ComponentName.spec.tsx` for component tests (in same directory)
4. Import component directly: `import ComponentName from './components/ComponentName'`
5. (Optional) Create story in `src/stories/`

#### Adding utility functions

1. Create or use existing file in `src/utils/`
2. Export pure functions with clear names
3. Add TypeScript types for parameters and return values
4. Write unit tests in corresponding `.test.ts` file
5. Import directly: `import { helperFunction } from '../utils/helpers'`

#### Adding a new service method

1. Add method to appropriate service (e.g., `jobService.ts`)
2. Define return type
3. Add error handling with try/catch
4. Write unit test in corresponding `.test.ts` file

#### Modifying database schema

1. Create new migration in `supabase/migrations/`
2. Use timestamp naming: `YYYYMMDDHHMMSS_description.sql`
3. Update TypeScript types in `src/types/types.ts`
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
4. **Barrel files**: Don't create `index.ts` files for components - import directly from source files
5. **Type definitions**: Domain types (`JobApplication`, `InterviewPhase`, etc.) live only in `src/types/types.ts` — import them from there; `src/lib/supabase.ts` exports only the client
6. **Security**: Always validate inputs and check authentication before operations
7. **Routing**: Use `e.stopPropagation()` on button click handlers inside clickable cards to prevent navigation
8. **Insert operations**: Use `.select().single()` after insert to get the created record with auto-generated fields

### Best Practices

- **Security**: Always consider security implications (see Security Considerations section)
- **Separation of concerns**: Extract non-trivial logic from component files to plain `.ts` files
- **Components**: Keep them focused and single-responsibility; avoid unnecessary folders
- **Hooks**: Extract reusable logic into custom hooks
- **Error handling**: Always handle errors gracefully, log to console (but not sensitive data)
- **Loading states**: Show loading UI during async operations
- **Accessibility**: Consider keyboard navigation and screen readers
- **Responsive design**: Test on multiple screen sizes
- **Performance**: Use `useCallback` and `useMemo` when appropriate
- **Code organization**: Group related functionality together, but keep it simple

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

- `src/App.tsx` - Router configuration
- `src/views/Dashboard.tsx` - Main dashboard page
- `src/views/JobDetail.tsx` - Job detail page
- `src/views/ResetPassword.tsx` - Password reset page
- `src/components/AuthForm.tsx` - Sign in / sign up form
- `src/components/ForgotPasswordModal.tsx` - Forgot password modal
- `src/components/AppShell.tsx` - Top bar, command palette, global shortcuts
- `src/components/JobTable.tsx` - Applications table
- `src/hooks/useHotkeys.ts` - Keyboard shortcuts
- `src/utils/jobFilters.ts` - Filtering, search and sorting
- `src/store/store.ts` - Zustand state management
- `src/lib/supabase.ts` - Supabase client
- `src/types/types.ts` - Shared TypeScript types
- `src/contexts/AuthContext.tsx` - Authentication
- `src/services/jobService.ts` - Job CRUD operations
- `src/services/interviewPhaseService.ts` - Interview phase CRUD operations
- `src/index.css` - Minimal CSS reset
- `src/tokens.css` - Design tokens (CSS custom properties)
- `src/typography.css` - Global element styles & utility classes
- `eslint.config.js` - Linting rules
- `vitest.config.ts` - Test configuration

### Useful Patterns

```typescript
// Routing
import { useNavigate, useParams } from 'react-router-dom';
const navigate = useNavigate();
navigate('/job/123');
const { id } = useParams<{ id: string }>();

// Zustand selectors
const jobs = useStore.use.jobs();
const phases = useStore.use.interviewPhases();
const setJobs = useStore.use.setJobs();

// Auth hook
const { user, signIn, signOut } = useAuth();

// Service calls
const jobs = await jobService.getJobs();
const phases = await interviewPhaseService.getPhasesByJobId(jobId);
const newPhase = await interviewPhaseService.createPhase(phaseData);

// Component with types
export default function MyComponent({ prop }: { prop: string }) { }

// Clickable card with stopPropagation on buttons
<div onClick={() => navigate(`/job/${id}`)}>
  <button onClick={(e) => { e.stopPropagation(); handleDelete(); }}>
    Delete
  </button>
</div>
```

---

**Last Updated**: October 21, 2026
**Project Version**: 0.0.0 (as per package.json)

**Recent Major Changes**:

- Added React Router for multi-page navigation (January 2026)
- Implemented interview phase tracking feature (January 2026)
- Created `views/` folder structure for route components (January 2026)
- Fully migrated to CSS Modules + CSS custom properties; removed Tailwind and DaisyUI (March–April 2026)
- UI overhaul: dense table, command palette, shortcuts, native dialogs, toasts, light/dark themes, enforced a11y in Storybook (October 2026)

**Key Principles**: Security First • Simplicity Over Complexity • Type Safety • Test Coverage
