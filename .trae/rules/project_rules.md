# File Organization Rules

## 3-Layer Architecture

### Layer 1: UI Components (`src/app/` & `src/components/`)
- **Purpose**: Pure presentation and user interaction
- **Rules**: No API calls, no business logic, use custom hooks for data
- **Files**: `*-chart.tsx`, `*-display.tsx`, `*-skeleton.tsx`

### Layer 2: Custom Hooks (`src/hooks/`)
- **Purpose**: Business logic, API calls, state management
- **Rules**: Handle all data operations, provide clean interfaces to components
- **Files**: `use-*.ts` (e.g., `use-weight.ts`, `use-blood-pressure.ts`)

### Layer 3: Services + API (`src/lib/services/` & `src/app/api/`)
- **Purpose**: Server logic, database operations, validation
- **Rules**: Combine Zod schemas with service logic, no UI-related code
- **Files**: `*.service.ts`, `route.ts`

## File Naming Conventions

- **Components**: `kebab-case.tsx` (e.g., `weight-trend-chart.tsx`)
- **Hooks**: `use-feature.ts` (e.g., `use-weight.ts`)
- **Services**: `feature.service.ts` (e.g., `weight.service.ts`)
- **API Routes**: `route.ts` in feature folders

## Anti-Patterns

❌ Direct API calls in components
❌ Separate validation files (merge into services)
❌ Mixed responsibilities across layers
❌ Too many abstraction layers

## TanStack Query Integration

### Purpose
- **Server State Management**: Handle API data fetching, caching, and synchronization
- **Used in Layer 2**: Custom hooks leverage TanStack Query for data operations
- **Benefits**: Automatic caching, background refetching, optimistic updates

### Implementation Pattern
```typescript
// In custom hooks (Layer 2)
export function useWeight() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['weights'],
    queryFn: fetchWeightEntries
  });
  
  const createMutation = useMutation({
    mutationFn: createWeightEntry,
    onSuccess: () => queryClient.invalidateQueries(['weights'])
  });
}
```

### Rules
- ✅ Use in custom hooks only (Layer 2)
- ✅ Define query keys consistently
- ✅ Handle loading and error states
- ❌ Never use directly in components (Layer 1)

## Benefits

✅ Clean separation of concerns
✅ Reusable business logic
✅ Easy testing and maintenance
✅ Consistent architecture patterns
✅ Optimized server state management