# Gustav Project Documentation & Requirements

This document summarizes the architectural decisions, coding standards, and project-specific requirements established during the initialization of the Gustav monorepo.

## 0. Product Direction
- **Purpose:** Gustav is a CMS for building user-owned sites, comparable in scope to WordPress but with stronger developer support.
- **Audience Balance:** Treat the product as intentionally 50/50 developer-friendly and user-friendly. Developers should feel encouraged to build plugins, while non-developer users should feel encouraged to try changes and modify their sites.
- **Product Bias:** Prefer approachable editing flows, typed extension points, and clear plugin contracts over hidden magic. User-facing CMS features should be understandable without requiring code, and developer-facing APIs should be predictable, typed, and easy to test.

## 1. Monorepo Architecture
- **Tooling:** PNPM Workspaces.
- **Workspace Packages:**
  - `apps/api`: NestJS API.
  - `apps/web`: React + Vite web/admin app.
  - `libs/types`: Shared API, CMS, and plugin type definitions.
  - `libs/sdk`: Browser/client SDK for calling the API.
  - `libs/config-eslint`: Shared lint/format configuration.
  - `libs/config-typescript`: Shared TypeScript configuration.
  - `plugins/core`: Built-in core content components and plugin definition.
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
  - Framework: Jest (API). Web uses Vite/TypeScript today and should use Vitest for new web unit tests unless the project adopts a different web test runner.
  - **Co-location:** All test files must be next to the file they test.
  - **Naming:** Unit tests use `.spec.ts`, E2E tests use `.e2e.ts`.

## 3. API Architecture (NestJS)
- **Structure:** Flat modules (single directory per module).
- **Database Centralization:** 
  - ALL entities and repositories must reside in `./apps/api/src/database`.
  - Subdirectories: `database/entities/` and `database/repositories/`.
  - The `DatabaseModule` is the parent for all DB assets to avoid circular dependencies.
  - **Naming:** All database table names must be prefixed with `gustav_` (e.g., `@Entity('gustav_users')`).
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
- **Database:** Local MariaDB/MySQL-compatible instance via `docker-compose.yml`.
- **Database Engine:** The current docker-compose service uses MariaDB on port `3306`, database `gustav`, root password `password`.
- **API Environment:** TypeORM CLI loads `apps/api/.env`; unset SendGrid-related secrets warn in development but throw in production.
- **Cleanliness:** No build artifacts (js, d.ts) should be emitted into `src` folders (enforced via `"noEmit": true` in web tsconfig).

## 7. CMS Domain Model
- **Pages:** Pages are addressable by `path`, have `slug`, `status`, optional parent/children relationships, and `showInNavigation` for navigation visibility.
- **Versioning:** Page updates are versioned through `PageVersion`. Keep version-aware behavior in mind when changing page write operations, publishing workflows, or revert behavior.
- **Components:** Pages are composed from `PageComponent` records. Components store `pluginName`, `componentName`, JSON stringified `props`, `displayOrder`, optional `parentId`, and optional `slot`.
- **Nested Layouts:** Components with `canHaveChildren` may contain child components. `Grid` uses `slot` to distribute child components across columns.
- **Plugin Settings:** Plugin-level settings are persisted through `PluginSetting` and exposed via `/plugins/:name/settings`.
- **Dynamic Schemas:** Site admins can define custom schemas (for example `BlogPost`) with fields, then manage records for each schema from the admin Schemas area. Gustav stores these in first-party dynamic schema/record tables rather than generating database tables per user schema.
- **Schema Dependencies:** Schema deletion must check dependencies first. If records, page components, template hooks, or future generated query hooks depend on a schema, deletion should be blocked unless the user explicitly confirms deletion of the dependent items.

## 8. Plugin Architecture
- **Registry:** The web app imports plugins from the Vite virtual module `virtual:gustav-plugins`.
- **Manifest:** `apps/web/vite.config.ts` reads root `gustav.plugins.json`; add plugin package names there to make them available in the web runtime.
- **Core Plugin:** `@gustav/core-plugin` is the built-in plugin package. It exports a `plugin: PluginDefinition` with content components such as Heading, RichText, Button, Image, Hero, Divider, Grid, and Card.
- **Plugin Contract:** Plugin packages should export a `plugin` object containing `name`, `components`, and optional `settingsSchema`.
- **Component Contract:** Component definitions include `name`, React `component`, `description`, optional `icon`, `defaultProps`, `schema`, and optional `canHaveChildren`.
- **Schema Fields:** Supported component/settings field types currently include `text`, `textarea`, `select`, `checkbox`, `number`, and `color`.
- **Developer Experience:** New plugin work should preserve typed definitions in `@gustav/types`, avoid coupling the API to React, and keep component schemas understandable for site owners editing content.

## 9. Extension Guidelines
- Put new shared API or plugin transfer types in `@gustav/types`, then consume them from API, SDK, web, and plugins.
- Mirror API controller capabilities in `@gustav/sdk` so the web app does not hand-roll fetch calls.
- Keep admin-only CMS mutations behind `@IsSuperAdmin()` unless a more specific permission model is introduced.
- When adding database tables, use migrations, keep `synchronize: false`, and preserve the `gustav_` table prefix convention.
- For new page/component behavior, update the renderer, editor, SDK, API service/controller, types, and tests together so public rendering and admin editing stay aligned.
- Future dynamic rendering should let static page components consume schema records through generated, schema-aware hooks or template bindings such as `loadBlogPosts()`. These bindings do not need to be authored as code by site admins, but they must remain dependency-tracked so schema deletion can warn about affected pages/components/templates.
