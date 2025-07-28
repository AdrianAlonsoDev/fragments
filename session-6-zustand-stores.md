# Session 6: Zustand State Management

## Overview
Migrate from local component state to centralized Zustand stores for better state management, persistence, and developer experience.

## Store Architecture

### 1. Auth Store (`/modules/auth/store/auth-store.ts`)
**State:**
- `session: Session | null`
- `userTeam: UserTeam | undefined`
- `isAuthDialogOpen: boolean`
- `authView: ViewType`

**Actions:**
- `setSession(session: Session | null)`
- `setUserTeam(team: UserTeam | undefined)`
- `setAuthDialog(open: boolean)`
- `setAuthView(view: ViewType)`
- `signOut()`

### 2. Project Store (`/modules/projects/store/project-store.ts`)
**State:**
- `projects: Project[]`
- `currentProjectId: string | null` (persisted)
- `selectedTemplate: 'auto' | TemplateId` (persisted)

**Actions:**
- `setProjects(projects: Project[])`
- `setCurrentProjectId(id: string | null)`
- `setSelectedTemplate(template: 'auto' | TemplateId)`
- `addProject(project: Project)`
- `updateProject(id: string, data: Partial<Project>)`
- `removeProject(id: string)`

### 3. Chat Store (`/modules/chat/store/chat-store.ts`)
**State:**
- `messages: Message[]`
- `fragment: DeepPartial<FragmentSchema> | undefined`
- `result: ExecutionResult | undefined`
- `currentTab: 'code' | 'fragment'`
- `chatInput: string` (persisted)
- `files: File[]`
- `isLoading: boolean`
- `isPreviewLoading: boolean`
- `error: Error | null`
- `errorMessage: string`
- `isRateLimited: boolean`

**Actions:**
- `setMessages(messages: Message[])`
- `addMessage(message: Message)`
- `updateMessage(message: Partial<Message>, index?: number)`
- `clearChat()`
- `undoLastMessage()`
- `setFragment(fragment: DeepPartial<FragmentSchema> | undefined)`
- `setResult(result: ExecutionResult | undefined)`
- `setCurrentTab(tab: 'code' | 'fragment')`
- `setChatInput(input: string)`
- `setFiles(files: File[])`
- `setCurrentPreview(preview: PreviewData)`
- `clearPreview()`
- `setLoadingStates(states: Partial<LoadingStates>)`

### 4. UI Store (`/modules/shared/store/ui-store.ts`)
**State:**
- `languageModel: LLMModelConfig` (persisted)
- `theme: 'light' | 'dark' | 'system'` (persisted)
- `sidebarOpen: boolean`

**Actions:**
- `setLanguageModel(model: LLMModelConfig)`
- `setTheme(theme: Theme)`
- `toggleSidebar()`

## Migration Strategy

### Phase 1: Create Store Files
1. Create store directories in each module
2. Implement stores with TypeScript
3. Add persistence where needed

### Phase 2: Replace Hook State
1. Replace `useState` calls with store hooks
2. Update component props
3. Remove prop drilling

### Phase 3: Cleanup
1. Remove unnecessary props
2. Simplify component interfaces
3. Update tests if any

## Benefits
- Centralized state management
- No prop drilling
- Built-in persistence
- Better debugging with Redux DevTools
- Simpler components
- Easy state sharing between components