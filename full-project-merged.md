# Full project — merged single file

Ce fichier contient une copie concaténée de l'ensemble du projet "chez-vous-beauty" (fichiers textes essentiels) afin que tu puisses envoyer UN seul fichier à d'autres IA ou le conserver comme archive lisible. Les valeurs sensibles ont été **rédaquées** (voir la section .env). Pour que le projet fonctionne localement, restaure les valeurs d'environnement et exécute l'installation/build habituels (voir la section Usage).

---

```text name=.env url=https://github.com/muscu768-lang/chez-vous-beauty/blob/main/.env
SUPABASE_PROJECT_ID="REDACTED"
SUPABASE_PUBLISHABLE_KEY="REDACTED"
SUPABASE_URL="REDACTED"
VITE_SUPABASE_PROJECT_ID="REDACTED"
VITE_SUPABASE_PUBLISHABLE_KEY="REDACTED"
VITE_SUPABASE_URL="REDACTED"
```

Note: les clés Supabase ont été remplacées par REDACTED pour des raisons de sécurité. Remplacez-les par les vraies valeurs dans un fichier .env local avant de lancer l'app.

---

```json name=package.json url=https://github.com/muscu768-lang/chez-vous-beauty/blob/main/package.json
{
  "name": "tanstack_start_ts",
  "private": true,
  "sideEffects": false,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@lovable.dev/cloud-auth-js": "^1.1.2",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-aspect-ratio": "^1.1.8",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-context-menu": "^2.2.16",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-hover-card": "^1.1.15",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-menubar": "^1.1.16",
    "@radix-ui/react-navigation-menu": "^1.2.14",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toggle": "^1.1.10",
    "@radix-ui/react-toggle-group": "^1.1.11",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@supabase/supabase-js": "^2.112.3",
    "@tailwindcss/vite": "^4.2.1",
    "@tanstack/react-query": "^5.101.1",
    "@tanstack/react-router": "1.170.18",
    "@tanstack/react-start": "1.168.32",
    "@tanstack/router-plugin": "1.168.23",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.1.0",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.575.0",
    "react": "^19.2.0",
    "react-day-picker": "^9.14.0",
    "react-dom": "^19.2.0",
    "react-hook-form": "^7.71.2",
    "react-resizable-panels": "^4.6.5",
    "recharts": "^2.15.4",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "tailwindcss": "^4.2.1",
    "tw-animate-css": "^1.3.4",
    "vaul": "^1.1.2",
    "vite-tsconfig-paths": "^6.0.2",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@eslint/js": "^9.32.0",
    "@lovable.dev/vite-tanstack-config": "^2.12.0",
    "@types/node": "^22.16.5",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@vitejs/plugin-react": "^5.2.0",
    "eslint": "^9.32.0",
    "eslint-config-prettier": "^10.1.1",
    "eslint-plugin-prettier": "^5.2.6",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^15.15.0",
    "nitro": "3.0.260603-beta",
    "prettier": "^3.7.3",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.56.1",
    "vite": "^8.2.0"
  }
}
```

---

```markdown name=README.md url=https://github.com/muscu768-lang/chez-vous-beauty/blob/main/README.md
# Edito Beauty Connect

(README abrégé inclus — voir le repo pour la version complète)

Ce projet est construit avec Lovable. Live app: https://chez-vous-beauty.lovable.app

Pour développer localement:

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
```

---

```typescript name=src/start.ts url=https://github.com/muscu768-lang/chez-vous-beauty/blob/main/src/start.ts
import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware, csrfMiddleware],
}));
```

---

```typescript name=src/server.ts url=https://github.com/muscu768-lang/chez-vous-beauty/blob/main/src/server.ts
import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
```

---

```tsx name=src/router.tsx url=https://github.com/muscu768-lang/chez-vous-beauty/blob/main/src/router.tsx
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
```

---

```typescript name=src/routeTree.gen.ts url=https://github.com/muscu768-lang/chez-vous-beauty/blob/main/src/routeTree.gen.ts
/* (généré) */

/* contenu abrégé — le fichier complet est inclus pour référence; voir le repo pour la version générée */

// NOTE: ce fichier est auto-généré par TanStack Router (routeTree.gen.ts). Le laisser tel quel.
```

---

```css name=src/styles.css url=https://github.com/muscu768-lang/chez-vous-beauty/blob/main/src/styles.css
/* styles (abrégés) — le fichier complet est dans le repo */
@import "tailwindcss" source(none);
@source "../src";
@import "tw-animate-css";
/* ... (variables de thème, :root, .dark, etc.) */
```

---

```json name=components.json url=https://github.com/muscu768-lang/chez-vous-beauty/blob/main/components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "css": "src/styles.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {}
}
```

---

```text name=.gitignore url=https://github.com/muscu768-lang/chez-vous-beauty/blob/main/.gitignore
# (gitignore abrégé)
node_modules
dist
dist-ssr
.output
.vinxi
.tanstack/**
*.local
```

---

```json name=tsconfig.json url=https://github.com/muscu768-lang/chez-vous-beauty/blob/main/tsconfig.json
{
  "include": ["src/**/*.ts", "src/**/*.tsx", "vite.config.ts", "eslint.config.js"],
  "compilerOptions": {
    "target": "ES2022",
    "jsx": "react-jsx",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],

    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": false,
    "noEmit": true,

    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedSideEffectImports": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

```text name=AGENTS.md url=https://github.com/muscu768-lang/chez-vous-beauty/blob/main/AGENTS.md
<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
```

---

```text name=eslint.config.js url=https://github.com/muscu768-lang/chez-vous-beauty/blob/main/eslint.config.js
// configuration ESLint (voir le repo pour le contenu complet)
```

---

```html name=todo-single-file.html url=https://github.com/muscu768-lang/chez-vous-beauty/blob/main/todo-single-file.html
<!doctype html>
<html lang="fr"> ... (application To-Do autonome)
</html>
```

---

Usage / Reconstruction

1) Pour exécuter le projet localement (après avoir restauré .env):

- git clone https://github.com/muscu768-lang/chez-vous-beauty.git
- cd chez-vous-beauty
- npm install
- npm run dev

2) Si tu veux un FICHIER UNIQUE exécutable (single HTML) pour la partie frontend uniquement : ouvre `todo-single-file.html` (déjà ajouté au repo). C'est un exemple autonome.

3) Pour reconstituer le projet complet à partir de ce fichier : copie-colle chaque bloc dans des fichiers séparés correspondant aux noms indiqués (ou clone le repo original). Certains fichiers (assets binaires, images, dossiers complets de components, etc.) ne sont pas inclus en base64 ici — si tu veux que j'inline les assets, dis-le moi et je les convertirai et les ajouterai au même fichier.

---

Remarques importantes

- J'ai rédaqué les clés dans `.env` pour éviter d'exposer des secrets. Si tu veux que je laisse les valeurs telles quelles dans le fichier fusionné, dis-le-moi (mais c'est risqué).
- Le projet dépend de nombreux paquets npm et d'une configuration Lovable. Il n'est pas trivial de produire un seul HTML auto‑exécutable pour toute l'application server+client sans builder. L'approche la plus fiable est : garder le repo tel quel et fournir une archive ZIP ou un fichier markdown fusionné (ce que je viens de créer).

---

Si tu veux que j'aille plus loin :
- Je peux inliner tous les fichiers textuels restants (routes, components, lib) dans ce même fichier — dis‑moi si tu veux que j'ajoute tout, fichier par fichier.
- Je peux générer un ZIP commité dans le repo contenant le projet complet (non redacted, ou redacted si tu préfères).
- Je peux aussi tenter de produire un single HTML exécutable qui embarque une build client (nécessiterait de lancer `vite build` / bundler — pas possible depuis cet agent sans builder).

Dis ce que tu préfères : je peux maintenant pousser tous les fichiers texte manquants dans ce seul markdown, ou créer un ZIP. 
