---
trigger: always_on
---

# Project Code Guide: Laravel + Inertia + React

This guide outlines the coding standards and best practices for this project. Follow these strictly to ensure consistency and quality.

## 1. Backend Standards (Laravel)

### Response JSON
Always use common helper functions from the base `Controller` for JSON responses:
- `return $this->jsonSuccess($message, $data = [], $code = 200)`
- `return $this->jsonError($message, $error = null, $code = 400)`
- `jsonError` handles logging and hides details in production.

### Controller Logic
- **Request-Service Pattern**: Use FormRequests for validation and Services for business logic.
- **Custom Messages**: Always implement `messages()` in FormRequests for user-friendly error messages.
- Use **Eloquent Resources** for ALL data returned to Inertia or API.
- **UUID & Security**: Use UUIDs for IDs in new tables to avoid exposing counts/sequential IDs.
- **Soft Deletes**: Implement `SoftDeletes` in models for better data persistence and recovery.
- Place controllers in `app/Http/Controllers/Admin` for administrative tasks.
- Keep controllers thin; use Services for complex business logic if necessary.
- Use `DB::transaction` for operations modifying multiple tables.
- Use Request (with messages) & Service pattern best practice

### Security & ACL
- Use `spatie/laravel-permission` for roles and permissions.
- Validate all incoming data using `$request->validate()` or FormRequests.

## 2. Frontend Standards (React + Inertia)

### Directory Casing (PascalCase)
- **Pages**: `resources/js/pages/Admin/Users/Index.tsx`
- **Components**: `resources/js/components/Admin/UserFormDialog.tsx`
- **Hooks**: `resources/js/hooks/admin/user-hooks.ts` (camelCase for hooks file)

### TypeScript
- **NO ANY**: Avoid `any` at all costs. Use proper interfaces/types.
- **Strict Typing**: Explicitly define types for props, API responses, and Zod schemas.
- **Paths**: Use `@/` alias for `resources/js/`.
- **Inference where possible**: Trust TypeScript's inference for hooks and components, but provide explicit types if inference fails.
- **Check Types**: Always run `npm run types` before finalizing changes.

### State Management & Fetching
- **React Query**: Use `@tanstack/react-query` for all server state (GET, POST, PUT, DELETE).
- **Hooks**: Centralize React Query logic in `resources/js/hooks/`.
- **Inertia State**: Use Inertia `usePage().props` ONLY for initial/global data (auth, flash, filters).

### Routing (Wayfinder)
- **NEVER** use hardcoded URLs like `/admin/users`.
- Use `laravel/wayfinder` generated helpers:
  ```typescript
  import users from '@/routes/admin/users';
  const url = users.index.url({ query: { page: 1 } });
  ```

## 3. Form Handling & Validation
- Use `react-hook-form` with `zod` resolver.
- **Group Shared Schemas**: Keep schemas in `resources/js/types/admin/*-schema.ts`.
- **Error Handling**: Use the global `handleServerError(err, form.setError)` utility to map 422 errors to fields.

## 4. UI/UX Guidelines (Shadcn UI)
- **Notifications**: Use `sonner` via `toast.success` or `toast.error`.
- **Loading States**: Always provide visual feedback.
  - Use `DataTableSkeleton` for tables.
  - Use `isPending` state on buttons.
- **Confirmations**: Use `ConfirmDialog` component instead of native `confirm()`.
- **Search**: Implement a 500ms debounce on search inputs to optimize API calls.

## 5. Persistence & Context
- Always update `task.md` and `walkthrough.md` in the `.gemini/antigravity/brain` directory to track progress and document changes.