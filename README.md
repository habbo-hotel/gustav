# Gustav

Gustav is a CMS that provides wordpress-like functionality for habbo retros.

# Developers

Gustav is a TypeScript monorepo managed with PNPM workspaces.

| Package                     | Description                                |
| --------------------------- | ------------------------------------------ |
| `apps/api`                  | NestJS API (TypeORM + MariaDB)             |
| `apps/web`                  | React + Vite site and admin app            |
| `libs/types`                | Shared API, CMS, and plugin types          |
| `libs/sdk`                  | Client SDK for calling the API             |
| `libs/config-eslint`        | Shared lint/format config                  |
| `libs/config-typescript`    | Shared TypeScript config                   |
| `plugins/*`                 | Plugins and themes (core, habbo, habbo-arcturus-plugin, peach-theme) |

Enabled plugins are listed in `gustav.plugins.json`.

Useful scripts (run from the repo root):

```sh
pnpm dev        # run all workspaces in dev mode
pnpm build      # build everything
pnpm lint       # lint everything
pnpm lint:fix   # lint and format everything
pnpm app:api <script>   # run a script in the API, e.g. pnpm app:api migration:up
pnpm app:web <script>   # run a script in the web app
```

# Local Setup

**Requirements:** Node.js 20+, PNPM 9+, Docker.

1. Install dependencies:

   ```sh
   pnpm install
   ```

2. Start MariaDB:

   ```sh
   docker compose up -d
   ```

3. Create `apps/api/.env`:

   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=password
   DB_NAME=gustav
   FRONTEND_URL=http://localhost:5173
   DISCORD_CLIENT_ID=
   DISCORD_CLIENT_SECRET=
   DISCORD_CALLBACK_URL=
   ```

4. Run database migrations:

   ```sh
   pnpm app:api migration:up
   ```

5. Start the dev servers:

   ```sh
   pnpm dev
   ```

   - Web: http://localhost:5173
   - API: http://localhost:3000
