# Component Breakdown Plan for page.tsx

## Current State Analysis (482 lines)

### State Variables (15+ pieces of state)
1. **UI State**
   - `mounted` - hydration check
   - `currentTab` - code/fragment toggle
   - `isPreviewLoading` - preview loading state
   - `isAuthDialogOpen` - auth dialog visibility
   - `authView` - sign in/sign up view
   - `isRateLimited` - rate limit status
   - `errorMessage` - error display

2. **Chat State**
   - `messages` - chat messages array
   - `chatInput` - current input text (localStorage)
   - `files` - uploaded files
   - `fragment` - AI-generated code fragment
   - `result` - execution result from sandbox

3. **Project State**
   - `currentProjectId` - selected project (localStorage)
   - `selectedTemplate` - template selection
   - `languageModel` - AI model config (localStorage)

4. **Derived/Hook State**
   - `session`, `userTeam` - from useAuth
   - `projects`, `createProject`, `deleteProject` - from useProjects
   - `project`, `projectMessages`, `saveMessage`, `projectLoading` - from useProject
   - `object`, `submit`, `isLoading`, `stop`, `error` - from useObject

### Key Functions
1. **Project Management**
   - `handleProjectSelect` (10 lines)
   - `handleProjectCreate` (16 lines)
   - `handleProjectDelete` (45 lines)

2. **Chat/Message Management**
   - `handleSubmitAuth` (54 lines)
   - `addMessage` (5 lines)
   - `setMessage` (9 lines)
   - `setCurrentPreview` (5 lines)

3. **Effects**
   - Message sync effect
   - Object update effect
   - Error handling effect
   - Project change effect

### Rendering Logic
- 3 different states: Loading, No Project, Active Project
- Duplicated NavBar and ProjectSelector components

## Proposed Component Structure

### 1. Custom Hooks
```typescript
// modules/chat/hooks/useChatState.ts
- Manages messages, fragment, result, currentTab
- Handles message operations (add, update, clear)
- Syncs with project messages

// modules/chat/hooks/useChatSubmission.ts
- Wraps useObject hook
- Handles submission logic
- Manages preview loading
- Saves messages to project

// modules/projects/hooks/useProjectManagement.ts
- Combines project selection, creation, deletion
- Handles state clearing on project change
- Manages sandbox lifecycle
```

### 2. Container Components
```typescript
// modules/projects/components/ProjectPageContainer.tsx (Main - ~100 lines)
- Top-level component
- Manages auth dialog
- Renders appropriate state (loading/empty/workspace)

// modules/projects/components/ProjectWorkspace.tsx (~80 lines)
- Active project layout
- Manages grid layout and responsive design
- Renders NavBar, Chat, ChatInput, Preview

// modules/projects/components/ProjectEmptyState.tsx (~40 lines)
- No project selected UI
- Welcome message and project selector
```

### 3. Presentational Components
```typescript
// modules/shared/components/LoadingState.tsx
- Reusable loading spinner

// modules/chat/components/ChatContainer.tsx
- Wraps Chat, ChatInput, ChatPicker, ChatSettings
- Uses custom hooks for state
```

## Implementation Steps

### Phase 1: Extract Custom Hooks
1. Create `useChatState` hook
   - Move message state and operations
   - Handle project message sync
   
2. Create `useChatSubmission` hook
   - Extract useObject logic
   - Handle submission flow
   - Manage preview and sandbox calls

3. Create `useProjectManagement` hook
   - Combine project operations
   - Handle state clearing
   - Manage project lifecycle

### Phase 2: Create Container Components
1. Create `ProjectEmptyState` component
   - Extract lines 346-394
   - Make it a clean presentational component

2. Create `ProjectWorkspace` component
   - Extract lines 395-479
   - Use composition for layout

3. Update `ProjectPageContainer` (main page.tsx)
   - Keep only top-level logic
   - Use new components and hooks
   - Handle routing between states

### Phase 3: Optimize and Clean
1. Remove duplicate code (NavBar appears twice)
2. Extract constants (model filtering logic)
3. Move helper functions to appropriate hooks
4. Add proper TypeScript types

## Expected Outcome

### Before
- 482 lines in one file
- 15+ state variables
- Mixed concerns
- Duplicate code

### After
- ~100 lines in main component
- 3-4 custom hooks with focused responsibilities
- 3-4 smaller components
- Clear separation of concerns
- Reusable, testable units

## Benefits
1. **Maintainability**: Each piece has single responsibility
2. **Testability**: Hooks and components can be tested in isolation
3. **Reusability**: Hooks can be used in other components
4. **Performance**: Better React optimization opportunities
5. **Developer Experience**: Easier to understand and modify