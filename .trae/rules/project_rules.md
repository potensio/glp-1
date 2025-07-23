# Package Manager Guidelines

Use pnpm instead of yarn/npm etc

# Architecture Guidelines

## 3-Layer Architecture Pattern

This project follows a strict 3-layer architecture to maintain clean, testable, and maintainable code.

### Layer 1: UI Components

**Purpose**: Pure presentation logic and user interaction

**Rules**:

- ❌ NO direct API calls in components
- ❌ NO business logic in components
- ✅ Use custom hooks for data operations
- ✅ Focus on UI state and user interactions
- ✅ Keep components testable and reusable

**Example**:

```tsx
// ✅ Good - Clean component using custom hook
export function MyComponent() {
  const { data, isLoading, createItem } = useMyData();
  // Only UI logic here
}

// ❌ Bad - Direct API call in component
export function MyComponent() {
  const handleSubmit = async () => {
    await fetch("/api/items", { method: "POST" }); // NO!
  };
}
```

### Layer 2: Custom Hooks (Business Logic)

**Purpose**: Abstract API calls, state management, and business logic

**Rules**:

- ✅ Handle all API communications
- ✅ Manage loading states and error handling
- ✅ Provide clean interfaces to components
- ✅ Include proper error handling and user feedback
- ✅ Make hooks reusable across components

**Example**:

```tsx
// ✅ Good - Custom hook with complete business logic
export function useMyData() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createItem = async (data: ItemInput) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create");
      toast({ title: "Success!" });
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return { createItem, isLoading };
}
```

### Layer 3: Services + Validation

**Purpose**: Server-side logic, database operations, and data validation

**Rules**:

- ✅ Combine validation schemas with service logic
- ✅ Handle database operations
- ✅ Export both client-side and server-side validation
- ✅ Keep services focused on data operations
- ❌ NO UI-related logic in services

**Example**:

```typescript
// ✅ Good - Service with integrated validation
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Client-side validation (for forms)
export const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.number().min(0, "Value must be positive"),
});

export type ItemInput = z.infer<typeof itemSchema>;

// Server-side validation (for API)
const createItemSchema = z.object({
  name: z.string().min(1),
  value: z.number().min(0),
  userId: z.string(),
});

export class ItemService {
  static async createItem(data: z.infer<typeof createItemSchema>) {
    const validated = createItemSchema.parse(data);
    return await prisma.item.create({ data: validated });
  }
}
```

## File Organization

```
src/
├── app/
│   └── components/           # Layer 1: UI Components
├── hooks/                    # Layer 2: Custom Hooks
├── lib/
│   ├── services/            # Layer 3: Services + Validation
│   └── validations/         # ❌ AVOID - Merge into services
└── api/                     # Layer 3: API Routes
```

## Migration Guidelines

### When Refactoring Existing Code:

1. **Identify the layers**: Separate UI, business logic, and data operations
2. **Create custom hooks**: Move API calls and state management from components
3. **Consolidate validation**: Move validation schemas into service files
4. **Remove separate validation files**: Merge them into services for single source of truth
5. **Update imports**: Ensure all files import from the correct layer

### Anti-Patterns to Avoid:

❌ **Too many layers**: Don't create unnecessary abstraction layers
❌ **Mixed responsibilities**: Don't put UI logic in services or API calls in components
❌ **Scattered validation**: Don't have validation in multiple places
❌ **Direct service imports in components**: Always use custom hooks as intermediary

## Real-World Implementation Examples

### Comprehensive Health Data Management
A complete example of our 3-layer architecture applied across all health metrics:

**UI Components Layer:**
- `WeightTrendClient` - Weight data with loading states and error handling
- `BloodPressureClient` - Blood pressure readings with skeleton loading
- `BloodSugarClient` - Blood sugar levels with error boundaries
- `CaloriesIntakeClient` - Food intake tracking with loading states
- Individual chart components (`WeightTrendChart`, `BloodPressureChart`, etc.) - Pure presentation
- Skeleton components for each chart type with appropriate animations

**Custom Hooks Layer:**
- `useWeight` - Weight data state, CRUD operations, chart data transformation
- `useBloodPressure` - Blood pressure management with status helpers
- `useBloodSugar` - Blood sugar tracking with measurement types
- `useFoodIntake` - Calorie tracking with daily aggregation
- Each hook provides: `chartData`, `isLoading`, `error`, `fetch*`, and `refetch`
- Consistent data transformation patterns for chart consumption

**Services + API Layer:**
- `/api/weights`, `/api/blood-pressures`, `/api/blood-sugars`, `/api/food-intakes`
- Service files with Zod validation and business logic
- Prisma database operations with proper error handling
- Consistent API response formats

### Component Consolidation
The `HealthDashboard` component demonstrates effective consolidation:
- Unified component displaying all four health charts
- Consistent loading states using `Suspense` with individual client components
- Reusable across multiple pages (home and progress)
- Centralized architecture with distributed data management
- Each chart maintains its own loading state and error handling

## Benefits

✅ **Clean Components**: Easy to test and maintain UI logic
✅ **Reusable Business Logic**: Custom hooks can be shared across components
✅ **Single Source of Truth**: Validation and data operations in one place
✅ **Better Testing**: Each layer can be tested independently
✅ **Maintainable**: Clear separation of concerns
✅ **Scalable**: Easy to add new features following the same pattern
✅ **Consolidation**: Reduces code duplication and file proliferation
✅ **Performance**: Proper loading states and error handling improve UX
✅ **Error Handling**: Consistent error boundaries and user feedback
✅ **Data Transformation**: Centralized logic for chart data formatting
✅ **State Management**: Predictable state updates across all health metrics

## Enforcement

- All new features MUST follow this 3-layer pattern
- Code reviews should verify layer separation
- Refactor existing code when making changes
- Use TypeScript to enforce proper imports and interfaces
- Consolidate duplicate functionality when found
- Prefer fewer, well-structured files over many scattered files
- Follow consistent hook patterns: All hooks should return similar interfaces (`chartData`, `isLoading`, `error`, `fetch*`, `refetch`)
- Use `*Client` components for data fetching and state management
- Transform API data in hooks, not in components
- Follow consistent naming: `use*` for hooks, `*Client` for data components, `*Chart` for presentation

## Success Metrics

- ✅ Reduced component file count through consolidation
- ✅ Consistent loading states across all data operations
- ✅ Reusable components across multiple pages
- ✅ Clean separation between UI, business logic, and data layers
- ✅ Improved maintainability and developer experience
- ✅ Architecture consistency across all health metrics
- ✅ Error resilience with graceful error handling
- ✅ Loading experience with skeleton animations
- ✅ Clear, predictable data flow from API to UI
- ✅ Easy to add new health metrics following established patterns

---

_This architecture ensures our codebase remains clean, testable, and maintainable as it grows._
