# DJL Foundation Identity Provider — Implementation Plan

> **Project:** DJL Foundation Authentication Provider (serverless Keycloak alternative)  
> **Stack:** TanStack Start + Better Auth + Prisma (PostgreSQL) + Paraglide i18n + Tailwind CSS + Shadcn UI  
> **Package Manager:** bun  
> **Base Locale:** German (de) — English (en) secondary

---

## Installed Skills

- [x] `better-auth/skills@better-auth-best-practices`
- [x] `better-auth/skills@email-and-password-best-practices`
- [x] `better-auth/skills@organization-best-practices`
- [x] `better-auth/skills@two-factor-authentication-best-practices`
- [x] `better-auth/skills@create-auth-skill`
- [x] `anthropics/skills@frontend-design`
- [x] `vercel-labs/skills@find-skills`
- [ ] `better-auth/skills@better-auth-security-best-practices` — Does not exist in the repo (only 5 skills available)

---

## Phase 0: Project Foundation & Environment

- [ ] **0.1** Update `project.inlang/settings.json` to set `baseLocale: "de"` (German as default)
- [ ] **0.2** Update `src/env.ts` — add all required environment variables with Zod validation:
  - `BETTER_AUTH_SECRET` (min 32 chars)
  - `BETTER_AUTH_URL`
  - `DATABASE_URL` (PostgreSQL connection string)
  - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `RESEND_API_KEY`
  - `TURNSTILE_SECRET_KEY`
  - `VITE_TURNSTILE_SITE_KEY`
- [ ] **0.3** Create `.env.example` with all env var placeholders
- [ ] **0.4** Update `.gitignore` if needed (ensure `.env`, `node_modules`, `.nitro`, `.output`, `src/paraglide` are ignored)
- [ ] **0.5** Install all required dependencies via `bun add`:
  - `prisma` + `@prisma/client` (Prisma ORM for PostgreSQL)
  - `resend` (email sending)
  - `@react-email/components` (React Email templates)
  - `@marsidev/react-turnstile` (CAPTCHA client widget)
  - `react-hook-form` + `@hookform/resolvers` (form handling)
  - Any missing Better Auth peer deps
  - **Note:** `@simplewebauthn/browser` NOT needed — Better Auth client provides passkey support natively
- [ ] **0.6** Run `bun update --latest` to ensure all deps are at latest versions

---

## Phase 1: Database & Better Auth Core Configuration

- [ ] **1.1** Initialize Prisma: `bunx prisma init` with PostgreSQL provider
- [ ] **1.2** Configure `src/lib/auth.ts` — Full Better Auth server config:
  - **Prisma adapter** (`better-auth/adapters/prisma`)
  - `emailAndPassword: { enabled: true, requireEmailVerification: true, sendResetPassword: ... }`
  - `username` plugin (username-based auth)
  - Social providers: `google`, `github`
  - `trustedOrigins` config
  - All plugins (see Phase 2)
  - **`user.deleteUser` hook** — automatically calls `/api/user/delete-account` endpoint on deletion
- [ ] **1.3** Configure `src/lib/auth-client.ts` — Client-side auth with all client plugins
- [ ] **1.4** Generate Prisma schema via Better Auth CLI: `bunx @better-auth/cli@latest generate`
- [ ] **1.5** Run `bunx prisma generate` + `bunx prisma db push` for schema sync
- [ ] **1.6** Verify auth works via `GET /api/auth/ok`

---

## Phase 2: Better Auth Plugins

### Authentication Plugins
- [ ] **2.1** `passkey` — Passkey/WebAuthn registration and login (client provided by Better Auth natively)
- [ ] **2.2** `twoFactor` — TOTP-based two-factor authentication (integrated into sign-in flow)
- [ ] **2.3** `username` — Username-based authentication

### Administration & API
- [ ] **2.4** `admin` — Admin panel: impersonate, list, edit, delete users
- [ ] **2.5** `openAPI` — Expose OpenAPI spec at `/api/auth/reference`
- [ ] **2.6** `apiKey` — API key plugin for programmatic access to protected endpoints

### Organizations
- [ ] **2.7** `organization` — Organization creation, member management, invitations, roles

### Security & Utility Plugins
- [ ] **2.8** `captcha` — Turnstile CAPTCHA plugin in auth.ts + `x-captcha-response` header in all client auth requests
- [ ] **2.9** `haveIBeenPwned` — Check passwords against HIBP on registration
- [ ] **2.10** `jwt` — JWT token support for stateless auth
- [ ] **2.11** `lastLoginMethod` — Track the last method the user used to log in
- [ ] **2.12** `i18n` — Better Auth i18n plugin for auth return messages (https://better-auth.com/docs/plugins/i18n)

### Framework Integration
- [ ] **2.13** `tanstackStartCookies()` — TanStack Start cookie handling (already exists, keep)

---

## Phase 3: Email System (React Email + Resend)

- [ ] **3.1** Create `src/lib/email.ts` — Resend client initialization
- [ ] **3.2** Create email templates using `@react-email/components`:
  - `src/emails/verification.tsx` — Email verification
  - `src/emails/password-reset.tsx` — Password reset
  - `src/emails/organization-invite.tsx` — Organization invitation
  - `src/emails/welcome.tsx` — Welcome email after verification
- [ ] **3.3** Wire up email sending in `auth.ts`:
  - `emailVerification.sendVerificationEmail`
  - `emailAndPassword.sendResetPassword`
  - `emailVerification.sendOnSignUp: true`
- [ ] **3.4** Create all email endpoints with React Email rendering + Resend delivery

---

## Phase 4: API Routes

- [ ] **4.1** `src/routes/api/auth/$.ts` — Better Auth catch-all handler (exists, update if needed)
- [ ] **4.2** `src/routes/api/user/delete-account.ts` — Account deletion endpoint:
  - Returns `500` with body `"Unimplemented"`
  - Better Auth's `user.deleteUser` hook automatically calls this endpoint
  - Purpose: IDP broadcasts to downstream apps to delete user from their DBs
  - Requires authentication
- [ ] **4.3** `src/routes/api/internal/auth-urls.ts` — Expose important Better Auth API URLs (locked behind API key)
- [ ] **4.4** Ensure OpenAPI spec is exposed (via `openAPI` plugin at `/api/auth/reference`)

---

## Phase 5: Internationalization (i18n)

- [ ] **5.1** Update `project.inlang/settings.json`: set `baseLocale: "de"`, `locales: ["de", "en"]`
- [ ] **5.2** Update `messages/de.json` — Complete German translations for all UI strings
- [ ] **5.3** Update `messages/en.json` — Complete English translations
- [ ] **5.4** Use Paraglide's `m.*` message functions throughout all UI components
- [ ] **5.5** Configure Better Auth's **i18n plugin** for auth-specific return messages (DE + EN)

---

## Phase 6: UI — Pages & Components

### Layout Strategy
Two distinct layouts:
1. **Full Layout** (navbar + footer) — for "bigger" pages: Root/Dashboard, Account Management, Admin Dashboard, Org pages
   - Navbar at top with navigation links; admin links only visible to admin users
   - Footer with Paraglide language dropdown selector + theme toggle
2. **Minimal Layout** (auth pipeline) — for auth pages: sign-in, sign-up, forgot-password, reset-password, verify-email
   - Logo at top-left (or back button)
   - Centered card with form content only
   - No navbar, no footer

**Forms:** Use **React Hook Form** with `@hookform/resolvers` for all forms.

### Root Layout
- [ ] **6.1** Update `__root.tsx` — Remove default Header/Footer from shell; render children only. Page title "DJL Foundation ID"
- [ ] **6.2** Create `src/components/layouts/FullLayout.tsx` — Navbar + content + Footer (with language selector + theme toggle)
- [ ] **6.3** Create `src/components/layouts/AuthLayout.tsx` — Minimal: logo/back button + centered card

### Public Pages
- [ ] **6.4** `src/routes/index.tsx` — Root route (uses Full Layout):
  - **Signed out:** Message explaining this is the DJL Foundation's authentication provider
  - **Signed in:** Small dashboard with user info (name, email, last login method, session info, linked accounts, etc.)
- [ ] **6.5** Delete `src/routes/about.tsx`

### Authentication Pages (Minimal Layout — centered card)
- [ ] **6.6** `src/routes/auth/sign-in.tsx` — Sign-in page:
  - Email & password form (React Hook Form)
  - Social login buttons (Google, GitHub)
  - Passkey login button
  - **TOTP 2FA entry integrated** — shows TOTP input when 2FA is required during sign-in
  - "Forgot password" link
  - Turnstile CAPTCHA with `x-captcha-response` header sent in fetch options
  - Link to sign-up
- [ ] **6.7** `src/routes/auth/sign-up.tsx` — Sign-up page:
  - Email, password, name, username fields (React Hook Form)
  - Social sign-up (Google, GitHub)
  - Turnstile CAPTCHA with `x-captcha-response` header
  - HIBP check feedback
  - Link to sign-in
- [ ] **6.8** `src/routes/auth/forgot-password.tsx` — Password reset request
- [ ] **6.9** `src/routes/auth/reset-password.tsx` — Password reset form (with token)
- [ ] **6.10** `src/routes/auth/verify-email.tsx` — Email verification handler

### User Account Pages (Full Layout, Authenticated)
- [ ] **6.11** `src/routes/account/index.tsx` — Account overview/settings:
  - Profile info (name, email, username, avatar)
  - Edit profile (React Hook Form)
  - Change password
  - Linked accounts (Google, GitHub)
  - Passkey management (register/remove)
  - **API Key management section** — only visible if user has Admin role
- [ ] **6.12** `src/routes/account/security.tsx` — Security settings:
  - Two-factor authentication setup/disable (TOTP)
  - Active sessions management
  - Passkey management
- [ ] **6.13** `src/routes/account/delete.tsx` — Account deletion page:
  - Confirmation UI
  - Calls the delete-account API (which returns 500 "Unimplemented")
  - Shows appropriate error/info message
- [ ] **6.14** `src/routes/account/organizations.tsx` — User's organizations:
  - List organizations the user belongs to
  - Create new organization
  - Leave organization

### Admin Pages (Full Layout, Admin Role Required)
- [ ] **6.15** `src/routes/admin/index.tsx` — Admin dashboard
- [ ] **6.16** `src/routes/admin/users.tsx` — User management:
  - List all users (paginated)
  - Search/filter users
  - Edit user details
  - Delete user
  - Impersonate user
- [ ] **6.17** `src/routes/admin/organizations.tsx` — Organization management (admin view)

### Organization Pages (Full Layout, Authenticated + Org Member)
- [ ] **6.18** `src/routes/org/$orgId/index.tsx` — Organization dashboard
- [ ] **6.19** `src/routes/org/$orgId/members.tsx` — Member management (invite, remove, change role)
- [ ] **6.20** `src/routes/org/$orgId/settings.tsx` — Organization settings

---

## Phase 7: Shadcn UI Components

- [ ] **7.1** Install required Shadcn components:
  - `button`, `input`, `label`, `card`, `dialog`, `dropdown-menu`
  - `form`, `table`, `tabs`, `badge`, `alert`, `avatar`
  - `separator`, `skeleton`, `toast/sonner`, `sheet`, `select`
- [ ] **7.2** Create reusable auth form components (with React Hook Form)
- [ ] **7.3** Create data table component for admin user listing

---

## Phase 8: Route Protection & Middleware

- [ ] **8.1** Create auth middleware/guard — Redirect unauthenticated users from protected routes
- [ ] **8.2** Create admin guard — Check admin role before allowing access to admin routes
- [ ] **8.3** Protect all `/account/*` routes — require authentication
- [ ] **8.4** Protect all `/admin/*` routes — require admin role
- [ ] **8.5** Protect all `/org/*` routes — require authentication + org membership
- [ ] **8.6** Root route `/` — accessible to all, but shows different content based on auth state

---

## Phase 9: API Key Integration

- [ ] **9.1** Configure API key plugin in Better Auth
- [ ] **9.2** Create API route that exposes important Better Auth API URLs, locked behind API key validation
- [ ] **9.3** API key management UI in account page (admin-only section)

---

## Phase 10: Testing

- [ ] **10.1** Write tests for the delete-account API route (returns 500 "Unimplemented")
- [ ] **10.2** Write tests for the internal auth-urls API route (API key validation)
- [ ] **10.3** Ensure existing tests pass
- [ ] **10.4** Run `bun run build` to verify no build errors

---

## Phase 11: Final Polish & Documentation

- [ ] **11.1** Update `README.md` with project description, setup instructions, features list
- [ ] **11.2** Ensure all i18n strings are complete in both DE and EN
- [ ] **11.3** Verify Biome linting passes (`bun run check`)
- [ ] **11.4** Final build verification (`bun run build`)
- [ ] **11.5** Review all security considerations (CSRF, rate limiting, HIBP, Turnstile)

---

## Environment Variables Summary

```env
# Core
BETTER_AUTH_SECRET=          # min 32 chars, generate with: openssl rand -base64 32
BETTER_AUTH_URL=             # e.g. https://id.djl-foundation.org

# Database
DATABASE_URL=                # PostgreSQL connection string

# OAuth - GitHub
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# OAuth - Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email
RESEND_API_KEY=

# CAPTCHA (Turnstile)
TURNSTILE_SECRET_KEY=
VITE_TURNSTILE_SITE_KEY=
```

---

## File Structure (Target)

```
prisma/
├── schema.prisma                # Prisma schema (generated by Better Auth CLI)
src/
├── components/
│   ├── ui/                      # Shadcn UI components
│   ├── layouts/
│   │   ├── FullLayout.tsx       # Navbar + footer layout (bigger pages)
│   │   └── AuthLayout.tsx       # Minimal layout (auth pipeline pages)
│   ├── LocaleSwitcher.tsx       # Paraglide dropdown language selector
│   └── ThemeToggle.tsx          # Existing
├── emails/
│   ├── verification.tsx         # Email verification template
│   ├── password-reset.tsx       # Password reset template
│   ├── organization-invite.tsx  # Org invite template
│   └── welcome.tsx              # Welcome email
├── integrations/
│   ├── better-auth/
│   │   └── header-user.tsx      # Updated auth header component
│   └── tanstack-query/
│       ├── devtools.tsx
│       └── root-provider.tsx
├── lib/
│   ├── auth.ts                  # Better Auth server config (Prisma adapter + all plugins)
│   ├── auth-client.ts           # Better Auth client config (all client plugins)
│   ├── auth-emails.tsx          # Email sending logic (React Email + Resend)
│   ├── email.ts                 # Resend client
│   ├── prisma.ts                # Prisma client singleton
│   └── utils.ts                 # Utility functions
├── routes/
│   ├── __root.tsx               # Root layout (minimal shell, no default header/footer)
│   ├── index.tsx                # Home (signed-out info / signed-in dashboard) — Full Layout
│   ├── auth/
│   │   ├── sign-in.tsx          # Sign-in + TOTP 2FA integrated — Auth Layout
│   │   ├── sign-up.tsx          # Sign-up — Auth Layout
│   │   ├── forgot-password.tsx  # Password reset request — Auth Layout
│   │   ├── reset-password.tsx   # Password reset form — Auth Layout
│   │   └── verify-email.tsx     # Email verification — Auth Layout
│   ├── account/
│   │   ├── index.tsx            # Account settings + API Key mgmt (admin only) — Full Layout
│   │   ├── security.tsx         # Security settings (2FA, sessions, passkeys) — Full Layout
│   │   ├── delete.tsx           # Account deletion — Full Layout
│   │   └── organizations.tsx    # User's organizations — Full Layout
│   ├── admin/
│   │   ├── index.tsx            # Admin dashboard — Full Layout
│   │   ├── users.tsx            # User management — Full Layout
│   │   └── organizations.tsx    # Org management — Full Layout
│   ├── org/
│   │   └── $orgId/
│   │       ├── index.tsx        # Org dashboard — Full Layout
│   │       ├── members.tsx      # Member management — Full Layout
│   │       └── settings.tsx     # Org settings — Full Layout
│   └── api/
│       ├── auth/
│       │   └── $.ts             # Better Auth handler
│       ├── user/
│       │   └── delete-account.ts
│       └── internal/
│           └── auth-urls.ts
├── env.ts                       # Environment validation
├── router.tsx
├── routeTree.gen.ts             # Auto-generated
└── styles.css                   # Tailwind + custom styles
```

---

## Notes

- The **delete-account endpoint** intentionally returns HTTP 500 "Unimplemented" — Better Auth's `user.deleteUser` hook automatically calls this endpoint. This is by design as the IDP needs to broadcast account deletion to all downstream applications before actually deleting the user.
- **Prisma** is used as the database ORM with Better Auth's Prisma adapter. Schema is generated via `bunx @better-auth/cli@latest generate`.
- **Paraglide** handles i18n on the frontend; Better Auth's **i18n plugin** handles auth-specific return messages.
- **German is the base/default locale**, English is secondary.
- **Two layouts:** Full Layout (navbar + footer) for main pages; Auth Layout (minimal centered card) for auth pipeline pages.
- **React Hook Form** is used for all forms with `@hookform/resolvers` for Zod validation.
- **Turnstile CAPTCHA** requires both the plugin in `auth.ts` AND `x-captcha-response` headers sent with every auth client request.
- **API Key management** is shown in the account page but only visible to users with the Admin role.
- The `better-auth-security-best-practices` skill does not exist in the better-auth/skills repository (only 5 skills are available).
