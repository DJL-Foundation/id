import { betterAuth } from 'better-auth'
import { apiKey } from '@better-auth/api-key'
import { passkey } from '@better-auth/passkey'
import { Pool } from 'pg'
import {
  admin,
  captcha,
  haveIBeenPwned,
  jwt,
  lastLoginMethod,
  openAPI,
  organization,
  twoFactor,
  username,
} from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { sendAuthEmail } from './auth-emails'

const isProduction = process.env.NODE_ENV === 'production'

const database = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : undefined,
    })
  : undefined

const trustedOrigins = [process.env.BETTER_AUTH_URL, process.env.SERVER_URL].filter(
  (origin): origin is string => Boolean(origin),
)

const socialProviders = {
  ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ? {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        },
      }
    : {}),
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {}),
}

const plugins = [
  tanstackStartCookies(),
  username(),
  passkey(),
  twoFactor(),
  organization(),
  admin(),
  apiKey({
    defaultPrefix: 'djl_',
    apiKeyHeaders: ['x-api-key'],
  }),
  openAPI({ path: '/openapi' }),
  jwt(),
  lastLoginMethod({ storeInDatabase: true }),
  haveIBeenPwned(),
]

if (process.env.TURNSTILE_SECRET_KEY) {
  plugins.push(
    captcha({
      provider: 'cloudflare-turnstile',
      secretKey: process.env.TURNSTILE_SECRET_KEY,
    }),
  )
}

export const auth = betterAuth({
  database,
  secret:
    process.env.BETTER_AUTH_SECRET ??
    'development-only-secret-change-before-production',
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.SERVER_URL,
  trustedOrigins,
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: 'Verifiziere dein DJL Foundation Konto',
        intro: 'Bitte bestätige deine E-Mail-Adresse, um dein Konto zu aktivieren.',
        ctaLabel: 'E-Mail bestätigen',
        ctaUrl: url,
      })
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: 'Passwort zurücksetzen',
        intro: 'Du hast eine Passwort-Zurücksetzung angefordert.',
        ctaLabel: 'Passwort zurücksetzen',
        ctaUrl: url,
      })
    },
  },
  socialProviders,
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: false,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    window: 30,
    max: 100,
  },
  advanced: {
    useSecureCookies: isProduction,
  },
  plugins,
})

export type Session = typeof auth.$Infer.Session
