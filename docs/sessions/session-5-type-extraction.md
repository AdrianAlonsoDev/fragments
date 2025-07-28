# Session 5: Type Extraction Plan

## Overview
Extract all inline types and interfaces into dedicated type files, remove `any` types, and improve type safety across the codebase.

## Types to Extract

### 1. Auth Module (`/modules/auth/types/index.ts`)
- `UserTeam` from auth.ts
- `ViewType` from auth.tsx
- `RedirectTo` from auth.tsx
- `AuthProps` interface from auth.tsx
- `SubComponentProps` interface from auth.tsx
- `SocialAuthProps` interface from auth.tsx
- `EmailAuthProps` interface from auth.tsx
- `UseAuthFormReturn` interface from auth.tsx

### 2. Chat Module (`/modules/chat/types/index.ts`)
- `UseChatStateProps` interface from useChatState.ts
- `UseChatSubmissionProps` interface from useChatSubmission.ts
- Content type for messages (replace `any`)

### 3. Projects Module (`/modules/projects/types/index.ts`)
- `UseProjectManagementProps` interface from useProjectManagement.ts
- `ProjectWorkspaceProps` interface from ProjectWorkspace.tsx
- `ProjectEmptyStateProps` interface from ProjectEmptyState.tsx
- Project creation data type (replace `any`)

### 4. Shared Module (`/modules/shared/types/index.ts`)
- `LoadingStateProps` interface from LoadingState.tsx
- Toast types from use-toast.ts
- Duration types from duration.ts

## `any` Types to Fix

1. **Project Types**
   - `content: any` → Define proper message content type
   - `fragment?: any` → Use `DeepPartial<FragmentSchema>`
   - `result?: any` → Use `ExecutionResult`

2. **Hook Parameters**
   - `createProject: (data: any)` → Define `ProjectCreateData` type
   - `deleteProject` error type → Define `SupabaseError` type

3. **Component Props**
   - `onProjectCreate: (data: any)` → Use `ProjectCreateData`
   - `error: any` → Define proper error types

4. **Template Types**
   - `currentTemplate: Templates | { [key: string]: any }` → Define `TemplateConfig` type

5. **Error Handling**
   - `catch (error: any)` → Use proper error types

## Execution Plan

1. Create type index files for each module
2. Extract interfaces from components/hooks
3. Define missing types to replace `any`
4. Update imports across codebase
5. Add type exports to module indexes

## Benefits
- Better IntelliSense support
- Catch type errors at compile time
- Easier refactoring
- Self-documenting code
- Reusable type definitions