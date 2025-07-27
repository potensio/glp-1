# GLP-1 Health Tracker - Project Rules & Patterns

## 3-Layer Architecture

### Layer 1: UI Components (`src/app/` & `src/components/`)

- **Purpose**: Pure presentation and user interaction
- **Rules**: No API calls, no business logic, use custom hooks for data
- **Files**: `*-chart.tsx`, `*-display.tsx`, `*-skeleton.tsx`
- **Loading Pattern**: Always destructure `{ data, isLoading, error }` from hooks

### Layer 2: Custom Hooks (`src/hooks/`)

- **Purpose**: Business logic, API calls, state management
- **Rules**: Handle all data operations, provide clean interfaces to components
- **Files**: `use-*.ts` (e.g., `use-weight.ts`, `use-blood-pressure.ts`)
- **Pattern**: Use TanStack Query for server state management

### Layer 3: Services + API (`src/lib/services/` & `src/app/api/`)

- **Purpose**: Server logic, database operations, validation
- **Rules**: Combine Zod schemas with service logic, no UI-related code
- **Files**: `*.service.ts`, `route.ts`

## TanStack Query Patterns

### 1. Query Hook Pattern

```typescript
// Standard query hook structure
export function useFeature(profileId?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["feature", profileId],
    queryFn: () => fetchFeatureData(profileId!),
    enabled: !!profileId, // Only run when profileId exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    data: data || [],
    isLoading,
    error,
    // Computed values
    stats: computeStats(data),
    latest: getLatest(data),
  };
}
```

### 2. Mutation Hook Pattern

```typescript
// Standard mutation with optimistic updates
export function useCreateFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFeatureEntry,
    onMutate: async (newEntry) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["feature"] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(["feature"]);

      // Optimistically update
      queryClient.setQueryData(["feature"], (old: any[]) => [
        ...old,
        { ...newEntry, id: Date.now(), createdAt: new Date() },
      ]);

      return { previousData };
    },
    onError: (err, newEntry, context) => {
      // Rollback on error
      queryClient.setQueryData(["feature"], context?.previousData);
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: ["feature"] });
    },
  });
}
```

### 3. Query Key Conventions

```typescript
// Consistent query key patterns
const QUERY_KEYS = {
  weights: (profileId: string) => ["weights", profileId],
  bloodPressure: (profileId: string) => ["blood-pressure", profileId],
  activities: (profileId: string) => ["activities", profileId],
  foodIntake: (profileId: string) => ["food-intake", profileId],
  bloodSugar: (profileId: string) => ["blood-sugar", profileId],
} as const;
```

## Loading State Patterns

### 1. Component-Level Loading

```typescript
// Individual component loading states
export function FeatureChart() {
  const { data, isLoading, error } = useFeature(profileId);

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="size-4" />
          <p>Failed to load data</p>
        </div>
      </Card>
    );
  }

  return <ActualChart data={data} />;
}
```

### 2. Granular Loading (Progress Overview Pattern)

```typescript
// Multiple independent loading states
export function ProgressOverview() {
  const {
    data: weightData,
    isLoading: weightLoading,
    error: weightError,
  } = useWeight();
  const {
    data: bpData,
    isLoading: bpLoading,
    error: bpError,
  } = useBloodPressure();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Each card loads independently */}
      {weightLoading ? (
        <ProgressCardSkeleton icon={Scale} />
      ) : weightError ? (
        <ProgressCardError title="Weight" icon={Scale} />
      ) : (
        <WeightCard data={weightData} />
      )}

      {/* Repeat pattern for other cards */}
    </div>
  );
}
```

### 3. Skeleton Components

```typescript
// Reusable skeleton patterns
export function ChartSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-64 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </Card>
  );
}

export function ProgressCardSkeleton({ icon: Icon }: { icon: any }) {
  return (
    <Card className="rounded-2xl gap-3 p-5 md:p-6">
      <div className="flex items-center gap-1">
        <Skeleton className="h-3 w-20" />
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-16" />
    </Card>
  );
}
```

## Error Handling Patterns

### 1. Component Error Boundaries

```typescript
// Graceful error display
export function ProgressCardError({
  title,
  icon: Icon,
}: {
  title: string;
  icon: any;
}) {
  return (
    <Card className="rounded-2xl gap-3 p-5 md:p-6">
      <div className="flex items-center gap-1">
        <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="size-4" />
        <p className="text-sm">Failed to load</p>
      </div>
    </Card>
  );
}
```

### 2. Hook Error Handling

```typescript
// Always return error state from hooks
export function useFeature() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["feature"],
    queryFn: fetchFeature,
    retry: 2, // Retry failed requests
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    data: data || [],
    isLoading,
    error, // Always expose error to components
  };
}
```

## Optimistic Update Patterns

### 1. Create Operations

```typescript
// Optimistic creation pattern
export function useCreateWeight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWeightEntry,
    onMutate: async (newWeight) => {
      await queryClient.cancelQueries({ queryKey: ["weights"] });

      const previousWeights = queryClient.getQueryData(["weights"]);

      // Add optimistic entry
      queryClient.setQueryData(["weights"], (old: WeightEntry[]) => [
        ...old,
        {
          ...newWeight,
          id: `temp-${Date.now()}`,
          createdAt: new Date(),
          isOptimistic: true, // Flag for UI feedback
        },
      ]);

      return { previousWeights };
    },
    onError: (err, newWeight, context) => {
      queryClient.setQueryData(["weights"], context?.previousWeights);
      toast.error("Failed to save weight entry");
    },
    onSuccess: () => {
      toast.success("Weight entry saved!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["weights"] });
    },
  });
}
```

### 2. Update Operations

```typescript
// Optimistic update pattern
export function useUpdateWeight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WeightEntry> }) =>
      updateWeightEntry(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["weights"] });

      const previousWeights = queryClient.getQueryData(["weights"]);

      // Update optimistically
      queryClient.setQueryData(["weights"], (old: WeightEntry[]) =>
        old.map((weight) =>
          weight.id === id ? { ...weight, ...data, isOptimistic: true } : weight
        )
      );

      return { previousWeights };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["weights"], context?.previousWeights);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["weights"] });
    },
  });
}
```

## Cache Management

### 1. Cache Configuration

```typescript
// Global cache settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### 2. Strategic Invalidation

```typescript
// Invalidate related queries after mutations
onSuccess: () => {
  // Invalidate specific queries
  queryClient.invalidateQueries({ queryKey: ["weights"] });

  // Invalidate related computed data
  queryClient.invalidateQueries({ queryKey: ["weight-stats"] });

  // Invalidate dashboard overview
  queryClient.invalidateQueries({ queryKey: ["progress-overview"] });
},
```

## Performance Optimization

### 1. Parallel Loading

```typescript
// Load multiple data sources in parallel
export function useDashboardData(profileId: string) {
  const weightQuery = useWeight(profileId);
  const bpQuery = useBloodPressure(profileId);
  const activityQuery = useActivity(profileId);

  // All queries run in parallel
  const isLoading =
    weightQuery.isLoading || bpQuery.isLoading || activityQuery.isLoading;
  const hasError = weightQuery.error || bpQuery.error || activityQuery.error;

  return {
    weight: weightQuery,
    bloodPressure: bpQuery,
    activity: activityQuery,
    isLoading,
    hasError,
  };
}
```

### 2. Background Refetching

```typescript
// Keep data fresh with background updates
const { data } = useQuery({
  queryKey: ["weights"],
  queryFn: fetchWeights,
  staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  refetchIntervalInBackground: true, // Continue refetching when tab not active
});
```

## File Naming Conventions

- **Components**: `kebab-case.tsx` (e.g., `weight-trend-chart.tsx`)
- **Hooks**: `use-feature.ts` (e.g., `use-weight.ts`)
- **Services**: `feature.service.ts` (e.g., `weight.service.ts`)
- **API Routes**: `route.ts` in feature folders
- **Types**: `feature.types.ts` or inline in service files

## Anti-Patterns

❌ **Avoid These Patterns:**

- Direct API calls in components
- `useSuspenseQuery` (causes build timeouts)
- Global loading states for independent data
- Separate validation files (merge into services)
- Mixed responsibilities across layers
- Too many abstraction layers
- Conditional hook calls
- Missing error boundaries

✅ **Follow These Patterns:**

- Use `useQuery` with proper loading/error handling
- Component-level or granular loading states
- Optimistic updates for better UX
- Consistent query key naming
- Strategic cache invalidation
- Parallel data fetching where possible
- Proper error boundaries and fallbacks

## Testing Patterns

### 1. Hook Testing

```typescript
// Test custom hooks with React Query
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

test("useWeight returns weight data", async () => {
  const { result } = renderHook(() => useWeight("profile-id"), {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.data).toBeDefined();
});
```

### 2. Component Testing

```typescript
// Test components with loading states
test("shows skeleton while loading", () => {
  // Mock hook to return loading state
  jest.mocked(useWeight).mockReturnValue({
    data: [],
    isLoading: true,
    error: null,
  });

  render(<WeightChart />);

  expect(screen.getByTestId("chart-skeleton")).toBeInTheDocument();
});
```

This documentation ensures consistent patterns across the entire application for optimal performance, user experience, and maintainability.
