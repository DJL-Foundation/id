# DJL Foundation Identity Provider — Implementation Plan

> **Project:** DJL Foundation Authentication Provider (serverless Keycloak alternative)  
> **Stack:** TanStack Start + Better Auth + PostgreSQL + Paraglide i18n + Tailwind CSS + Shadcn UI  
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
- [ ] **0.5** Install all required dependencies:
  - `pg` (PostgreSQL driver)
  - `resend` (email sending)
  - `@react-email/components` (React Email templates)
  - `@marsidev/react-turnstile` (CAPTCHA client widget)
  - `@simplewebauthn/browser` (passkey client)
  - Any missing Better Auth peer deps

---

## Phase 1: Database & Better Auth Core Configuration

- [ ] **1.1** Configure `src/lib/auth.ts` — Full Better Auth server config:
  - PostgreSQL database adapter (`pg` Pool)
  - `emailAndPassword: { enabled: true, requireEmailVerification: true, sendResetPassword: ... }`
  - `username` plugin (username-based auth)
  - Social providers: `google`, `github`
  - `trustedOrigins` config
  - All plugins (see Phase 2)
- [ ] **1.2** Configure `src/lib/auth-client.ts` — Client-side auth with all client plugins
- [ ] **1.3** Run `npx @better-auth/cli@latest migrate` to generate DB schema
- [ ] **1.4** Verify auth works via `GET /api/auth/ok`

---

## Phase 2: Better Auth Plugins

### Authentication Plugins
- [ ] **2.1** `passkey` — Passkey/WebAuthn registration and login
- [ ] **2.2** `twoFactor` — TOTP-based two-factor authentication
- [ ] **2.3** `username` — Username-based authentication

### Administration & API
- [ ] **2.4** `admin` — Admin panel: impersonate, list, edit, delete users
- [ ] **2.5** `openAPI` — Expose OpenAPI spec at `/api/auth/reference`
- [ ] **2.6** `apiKey` — API key plugin for programmatic access to protected endpoints

### Organizations
- [ ] **2.7** `organization` — Organization creation, member management, invitations, roles

### Security & Utility Plugins
- [ ] **2.8** `captcha` — Turnstile CAPTCHA on sign-up/sign-in
- [ ] **2.9** `haveIBeenPwned` — Check passwords against HIBP on registration
- [ ] **2.10** `jwt` — JWT token support for stateless auth
- [ ] **2.11** `lastLoginMethod` — Track the last method the user used to log in

### Framework Integration
- [ ] **2.12** `tanstackStartCookies()` — TanStack Start cookie handling (already exists, keep)

---

## Phase 3: Email System (React Email + Resend)

- [ ] **3.1** Create `src/lib/email.ts` — Resend client initialization
- [ ] **3.2** Create email templates using `@react-email/components`:
  - `src/emails/verification.tsx` — Email verification
  - `src/emails/password-reset.tsx` — Password reset
  - `src/emails/organization-invite.tsx` — Organization invitation
  - `src/emails/two-factor.tsx` — 2FA verification code (if needed)
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
  - Purpose: IDP broadcasts to downstream apps to delete user from their DBs
  - Requires authentication
- [ ] **4.3** `src/routes/api/internal/auth-urls.ts` — Expose important Better Auth API URLs (locked behind API key)
- [ ] **4.4** Ensure OpenAPI spec is exposed (via `openAPI` plugin at `/api/auth/reference`)

---

## Phase 5: Internationalization (i18n)

- [ ] **5.1** Update `project.inlang/settings.json`: set `baseLocale: "de"`, `locales: ["de", "en"]`
- [ ] **5.2** Update `messages/de.json` — Complete German translations for all UI strings:
  - Navigation, buttons, form labels, error messages
  - Auth-related: sign in, sign up, sign out, password, email, etc.
  - Dashboard, admin, organization terminology
- [ ] **5.3** Update `messages/en.json` — Complete English translations
- [ ] **5.4** Use Paraglide's `m.*` message functions throughout all UI components
- [ ] **5.5** Configure Better Auth's i18n support (if available) or handle via Paraglide

---

## Phase 6: UI — Pages & Components

### Layout & Navigation
- [ ] **6.1** Redesign `Header.tsx` — DJL Foundation branding, conditional nav (signed-in vs signed-out)
- [ ] **6.2** Redesign `Footer.tsx` — DJL Foundation footer with proper links
- [ ] **6.3** Update `__root.tsx` — Proper page title "DJL Foundation ID", meta tags

### Public Pages (Signed-Out)
- [ ] **6.4** `src/routes/index.tsx` — Root route:
  - **Signed out:** Message explaining this is the DJL Foundation's authentication provider
  - **Signed in:** Small dashboard with miscellaneous user info (name, email, last login method, session info, linked accounts, etc.)
- [ ] **6.5** Remove or repurpose `src/routes/about.tsx` (not required)

### Authentication Pages
- [ ] **6.6** `src/routes/auth/sign-in.tsx` — Sign-in page:
  - Email & password form
  - Social login buttons (Google, GitHub)
  - Passkey login button
  - "Forgot password" link
  - Turnstile CAPTCHA
  - Link to sign-up
- [ ] **6.7** `src/routes/auth/sign-up.tsx` — Sign-up page:
  - Email, password, name, username fields
  - Social sign-up (Google, GitHub)
  - Turnstile CAPTCHA
  - HIBP check feedback
  - Link to sign-in
- [ ] **6.8** `src/routes/auth/forgot-password.tsx` — Password reset request
- [ ] **6.9** `src/routes/auth/reset-password.tsx` — Password reset form (with token)
- [ ] **6.10** `src/routes/auth/verify-email.tsx` — Email verification handler
- [ ] **6.11** `src/routes/auth/two-factor.tsx` — 2FA verification page (TOTP entry)

### User Account Pages (Authenticated)
- [ ] **6.12** `src/routes/account/index.tsx` — Account overview/settings:
  - Profile info (name, email, username, avatar)
  - Edit profile
  - Change password
  - Linked accounts (Google, GitHub)
  - Passkey management (register/remove)
- [ ] **6.13** `src/routes/account/security.tsx` — Security settings:
  - Two-factor authentication setup/disable
  - Active sessions management
  - Passkey management
- [ ] **6.14** `src/routes/account/delete.tsx` — Account deletion page:
  - Confirmation UI
  - Calls the delete-account API (which returns 500 "Unimplemented")
  - Shows appropriate error/info message
- [ ] **6.15** `src/routes/account/organizations.tsx` — User's organizations:
  - List organizations the user belongs to
  - Create new organization
  - Leave organization

### Admin Pages (Admin Role)
- [ ] **6.16** `src/routes/admin/index.tsx` — Admin dashboard
- [ ] **6.17** `src/routes/admin/users.tsx` — User management:
  - List all users (paginated)
  - Search/filter users
  - Edit user details
  - Delete user
  - Impersonate user
- [ ] **6.18** `src/routes/admin/organizations.tsx` — Organization management (admin view)

### Organization Pages
- [ ] **6.19** `src/routes/org/$orgId/index.tsx` — Organization dashboard
- [ ] **6.20** `src/routes/org/$orgId/members.tsx` — Member management (invite, remove, change role)
- [ ] **6.21** `src/routes/org/$orgId/settings.tsx` — Organization settings

---

## Phase 7: Shadcn UI Components

- [ ] **7.1** Install required Shadcn components:
  - `button`, `input`, `label`, `card`, `dialog`, `dropdown-menu`
  - `form`, `table`, `tabs`, `badge`, `alert`, `avatar`
  - `separator`, `skeleton`, `toast/sonner`, `sheet`
- [ ] **7.2** Create reusable auth form components
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
- [ ] **9.3** Document available API key-protected endpoints

---

## Phase 10: Testing

- [ ] **10.1** Write tests for the delete-account API route (returns 500 "Unimplemented")
- [ ] **10.2** Write tests for the internal auth-urls API route (API key validation)
- [ ] **10.3** Ensure existing tests pass
- [ ] **10.4** Run `npm run build` to verify no build errors

---

## Phase 11: Final Polish & Documentation

- [ ] **11.1** Update `README.md` with:
  - Project description (DJL Foundation Identity Provider)
  - Setup instructions (env vars, database, migrations)
  - Available features list
  - API documentation reference
- [ ] **11.2** Ensure all i18n strings are complete in both DE and EN
- [ ] **11.3** Verify Biome linting passes (`npm run check`)
- [ ] **11.4** Final build verification (`npm run build`)
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
src/
├── components/
│   ├── ui/                      # Shadcn UI components
│   ├── Header.tsx               # Updated with DJL branding
│   ├── Footer.tsx               # Updated footer
│   ├── LocaleSwitcher.tsx       # Existing
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
│   ├── auth.ts                  # Better Auth server config (full)
│   ├── auth-client.ts           # Better Auth client config (full)
│   ├── auth-emails.tsx          # Email sending logic
│   ├── email.ts                 # Resend client
│   └── utils.ts                 # Utility functions
├── routes/
│   ├── __root.tsx               # Root layout
│   ├── index.tsx                # Home (signed-out info / signed-in dashboard)
│   ├── auth/
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   ├── forgot-password.tsx
│   │   ├── reset-password.tsx
│   │   ├── verify-email.tsx
│   │   └── two-factor.tsx
│   ├── account/
│   │   ├── index.tsx            # Account settings
│   │   ├── security.tsx         # Security settings (2FA, sessions, passkeys)
│   │   ├── delete.tsx           # Account deletion
│   │   └── organizations.tsx    # User's organizations
│   ├── admin/
│   │   ├── index.tsx            # Admin dashboard
│   │   ├── users.tsx            # User management
│   │   └── organizations.tsx    # Org management
│   ├── org/
│   │   └── $orgId/
│   │       ├── index.tsx        # Org dashboard
│   │       ├── members.tsx      # Member management
│   │       └── settings.tsx     # Org settings
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

- The **delete-account endpoint** intentionally returns HTTP 500 "Unimplemented" — this is by design as the IDP needs to broadcast account deletion to all downstream applications before actually deleting the user.
- **Paraglide** handles i18n on the frontend; Better Auth's built-in i18n is configured for auth-specific error messages.
- **German is the base/default locale**, English is secondary.
- The `better-auth-security-best-practices` skill does not exist in the better-auth/skills repository (only 5 skills are available). Security best practices from the `better-auth-best-practices` skill are used instead.
