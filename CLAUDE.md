# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start dev server (auto-kills process on port 3000)
npm run build    # Production build
npm run lint     # Run ESLint
npm start        # Start production server
```

## Architecture Overview

This is a Next.js 15 App Router frontend for a hockey analytics platform. It communicates with a FastAPI backend for data and authentication.

### Provider Hierarchy (src/app/layout.tsx)

```
ErrorBoundary
  └─ NotificationProvider
      └─ AuthProvider
          └─ QueryProvider
              └─ App content
```

- **AuthProvider**: Manages user state, login/logout, opens auth modal for protected actions
- **NotificationProvider**: Toast notifications via `useNotification()` hook
- **QueryProvider**: TanStack Query client for server state caching

### Data Flow Pattern

```
Page Component
    ↓ uses
TanStack Query Hook (src/hooks/queries/)
    ↓ calls
API Function (src/lib/api/)
    ↓ uses
apiCall() client (src/lib/api/client.ts)
    ↓ fetches
FastAPI Backend
```

**Query Hook Example** (`src/hooks/queries/getPlayerCards.ts`):
```typescript
export function usePlayerCards(params) {
    return useQuery({
        queryKey: ['players', { ...params }],
        queryFn: () => fetchPlayerCards(params),
        enabled,
    });
}
```

### Key Directories

- `src/hooks/queries/` - TanStack Query hooks wrapping API calls
- `src/lib/api/` - API client, endpoint functions, error handling
- `src/lib/auth/` - Token storage utilities
- `src/providers/` - React context providers
- `src/types/api/` - TypeScript types for API responses
- `src/constants/filters.ts` - Filter options (seasons, leagues, positions) and defaults
- `src/components/shared/` - Reusable UI components (navbar, footer, table, dropdown, etc.)
- `src/components/auth/` - Authentication components (modal, forms, protected routes)
- `src/components/cards/` - Player/goalie card components

### API Client (src/lib/api/client.ts)

- Automatically transforms camelCase params to snake_case for API compatibility
- Handles 401 responses with token refresh retry
- All requests go through `apiCall<T>(endpoint, method, data?, params?)`

### Authentication Flow

1. `useAuth()` hook provides `user`, `isAuthenticated`, `login`, `logout`, `openAuthModal`
2. Protected actions call `openAuthModal(pendingAction)` if not authenticated
3. After successful login, pending action executes automatically
4. Tokens stored via `src/lib/auth/tokens.ts` utilities

### Filter Constants (src/constants/filters.ts)

```typescript
DEFAULT_SEASON_ID = 52      // Current season
DEFAULT_LEAGUE_ID = 37      // NHL
DEFAULT_GAME_TYPE_ID = 1    // Regular season
DEFAULT_CARD_PAGE_SIZE = 24
```

## Styling Conventions

- Each component has colocated CSS file (e.g., `Navbar.tsx` + `navbar.css`)
- Use Tailwind CSS 4 utility classes for layout, custom CSS for complex styling
- BEM-inspired class naming: `.component-element-modifier`
- CSS variables for fonts: `--font-jetbrains-mono`, `--font-rajdhani`, `--font-geist-sans`

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000  # Required for API connection
```

## Import Aliases

Use `@/` for imports from `src/`:
```typescript
import { usePlayerCards } from '@/hooks/queries';
import type { CardResponse } from '@/types/api';
import { useAuth } from '@/providers/AuthProvider';
```
