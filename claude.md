# Gustav Project Documentation & Requirements

This document summarizes the architectural decisions, coding standards, and project-specific requirements established during the initialization of the Gustav monorepo.

## 1. Monorepo Architecture
- **Tooling:** PNPM Workspaces.
- **Root Scripts:**
  - `pnpm app:api`: Shortcut for API workspace.
  - `pnpm app:web`: Shortcut for Web workspace.
  - `pnpm lib:types`: Shortcut for Shared Types workspace.
  - `pnpm lib:sdk`: Shortcut for Shared SDK workspace.
  - Every project must support `dev` and `build` commands.

## 2. Coding Standards
- **Linter/Formatter:** Google TypeScript Style (GTS).
- **Configuration:** Shared internal packages (`@gustav/config-eslint`, `@gustav/config-typescript`) extended by apps.
- **Testing:**
  - Framework: Jest (API), Vitest/Vite (Web).
  - **Co-location:** All test files must be next to the file they test.
  - **Naming:** Unit tests use `.spec.ts`, E2E tests use `.e2e.ts`.

## 3. API Architecture (NestJS)
- **Structure:** Flat modules (single directory per module).
- **Database Centralization:** 
  - ALL entities and repositories must reside in `./apps/api/src/database`.
  - Subdirectories: `database/entities/` and `database/repositories/`.
  - The `DatabaseModule` is the parent for all DB assets to avoid circular dependencies.
- **Base Repository:** A reusable `BaseRepository<T>` provides standard CRUD (`findAll`, `findById`, `createOne`, `updateOne`, `deleteOne`) and simplifies dependency injection by only requiring the entity and `DataSource`.
- **Authentication:**
  - **Method:** Cookie-based sessions using `express-session` and `cookie-parser`.
  - **Passport:** Integrated for Local and Discord (OAuth2) strategies.
  - **Authorization:** Custom `@IsSuperAdmin()` decorator and `SuperAdminGuard` for protecting endpoints based on the `isSuperAdmin` boolean in the User entity.
- **Data Structures (DTOs & Return Objects):**
  - **Inbound DTOs:** Must be suffixed with `Input` (e.g., `RegisterInput`, `LoginInput`).
  - **Outbound/Return Objects:** Must be suffixed with `Wire` (e.g., `UserWire`, `AuthWire`).
  - This naming convention applies to all types used for data transfer in the API and SDK.

## 4. Frontend Architecture (React + Vite)
- **Styling:** Tailwind CSS v4 using the `@tailwindcss/postcss` plugin.
- **UI Requirements:** Full support for Light and Dark modes with high-contrast text and themed components.
- **Communication:** Uses a custom `@gustav/sdk` which wraps `fetch` with `credentials: 'include'` for automatic session management.

## 5. Shared Libraries
- **`@gustav/types`:** Centralized TypeScript interfaces (e.g., `User`) shared between frontend and backend.
- **`@gustav/sdk`:** 
  - `BaseSDK`: Core HTTP client wrapping `fetch`.
  - Controller-specific SDKs (e.g., `AuthSDK`, `UserSDK`) mirror API controllers for type-safe interaction.

## 6. Developer Environment
- **Database:** Local MySQL instance via `docker-compose.yml`.
- **Cleanliness:** No build artifacts (js, d.ts) should be emitted into `src` folders (enforced via `"noEmit": true` in web tsconfig).
