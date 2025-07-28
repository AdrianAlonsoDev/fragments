# Refactor Scratchpad

## Current Status
- Starting major refactor to modular architecture
- No backwards compatibility - straight forward approach
- Focus: Folder structure → Move files → Fix imports → Decompose

## Key Decisions
1. NO /src directory - keep root level organization
2. Modular structure by domain (auth, projects, chat, sandbox)
3. Zustand for state management
4. TypeScript strict mode

## Progress Tracking

### Phase 1: Folder Structure & File Organization
- [x] Create `/modules` directory structure
- [x] Move `/lib` files to appropriate modules
- [x] Move `/components` to module-specific folders
- [x] Move `/hooks` to module-specific folders
- [x] Update all imports
- [x] Fix Tailwind config to include new paths

### Phase 2: Type System
- [ ] Create dedicated type files per module
- [ ] Remove all `any` types
- [ ] Create shared types directory

### Phase 3: Component Breakdown
- [ ] Break down page.tsx into smaller components
- [ ] Extract business logic from components
- [ ] Create container/presentational separation

### Phase 4: State Management
- [ ] Install Zustand
- [ ] Create store files
- [ ] Migrate from useState to stores

## File Movement Map

### /lib → /modules
- auth.ts → modules/auth/lib/auth.ts
- project-types.ts → modules/projects/types/project.types.ts
- sandbox-manager.ts → modules/sandbox/lib/sandbox-manager.ts
- messages.ts → modules/chat/types/message.types.ts
- types.ts → modules/shared/types/index.ts
- models.ts → modules/ai/lib/models.ts
- templates.ts → modules/templates/lib/templates.ts
- supabase.ts → infrastructure/supabase/client.ts
- utils.ts → modules/shared/lib/utils.ts

### /components → /modules/*/components
- auth*.tsx → modules/auth/components/
- chat*.tsx → modules/chat/components/
- project-selector.tsx → modules/projects/components/
- fragment*.tsx → modules/sandbox/components/
- preview.tsx → modules/sandbox/components/
- navbar.tsx → modules/shared/components/
- ui/* → modules/shared/components/ui/

### /hooks → /modules/*/hooks
- useProject.ts → modules/projects/hooks/useProject.ts

## Import Path Updates Needed
- @/lib/* → @/modules/*/lib/*
- @/components/* → @/modules/*/components/*
- @/hooks/* → @/modules/*/hooks/*

## Completed in Phase 1
- ✅ Created modular folder structure
- ✅ Moved all files to appropriate modules
- ✅ Updated all import paths (70+ files)
- ✅ Fixed Tailwind configuration
- ✅ Resolved all build errors

## Issues Fixed
- Fixed broken CSS by updating Tailwind content paths
- Resolved all import path errors
- Maintained full functionality

## Next Immediate Steps
1. Start breaking down page.tsx (482 lines)
2. Extract types to dedicated files
3. Begin Zustand implementation