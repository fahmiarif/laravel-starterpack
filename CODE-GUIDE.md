# Project Code Guide: Laravel + Inertia + React

This guide outlines the coding standards and best practices for this project. Follow these strictly to ensure consistency and quality.

## 1. Backend Standards (Laravel)

### Response JSON
Always use common helper functions from the base `Controller` for JSON responses:
- `return $this->jsonSuccess($message, $data = [], $code = 200)`
- `return $this->jsonError($message, $error = null, $code = 400)`

### Controller & Logic Pattern
- **Request-Service Pattern**: Use FormRequests for validation and Services for business logic.
- **Custom Messages**: Always implement `messages()` in FormRequests for user-friendly error messages.
- **Eloquent Resources**: Use resources for ALL data returned to Inertia or API.
- **UUID & Security**: Use UUIDs for IDs in new tables to avoid exposing counts/sequential IDs.
- **Soft Deletes**: Implement `SoftDeletes` in models for better data persistence and recovery.
- Keep controllers thin; delegate all logic to Services.
- Use `DB::transaction` for operations modifying multiple tables.

### Security & ACL
- Use `spatie/laravel-permission` for roles and permissions.

## 2. Frontend Standards (React + Inertia)

### TypeScript: Type Safety First
- **NO ANY**: Avoid `any` at all costs. Use proper interfaces/types.
- **Strict Typing**: Explicitly define types for props, API responses, and Zod schemas.
- **Inference where possible**: Trust TypeScript's inference for hooks and components, but provide explicit types if inference fails.
- **Check Types**: Always run `npm run types` before finalizing changes.

### State Management & Fetching
- **React Query**: Use `@tanstack/react-query` for all server state (GET, POST, PUT, DELETE).
- **Hooks**: Centralize React Query logic in `resources/js/hooks/`.

### Routing (Wayfinder)
- **NEVER** use hardcoded URLs like `/admin/users`.
- Use `laravel/wayfinder` generated helpers.

## 3. UI/UX Guidelines (Shadcn UI)
- **Notifications**: Use `sonner` via `toast.success` or `toast.error`.
- **Loading States**: Always provide visual feedback (Skeleton for tables, pending states for buttons).
- **Confirmations**: Use `ConfirmDialog` component.
- **Search**: Implement a 500ms debounce on search inputs.

## 4. Persistence & Context
- Always update `task.md` and `walkthrough.md` in the `.gemini/antigravity/brain` directory.
