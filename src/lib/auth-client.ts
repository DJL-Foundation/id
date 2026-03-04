import { createAuthClient } from 'better-auth/react'
import { apiKeyClient } from '@better-auth/api-key/client'
import { passkeyClient } from '@better-auth/passkey/client'
import {
  adminClient,
  organizationClient,
  twoFactorClient,
  usernameClient,
} from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [
    passkeyClient(),
    apiKeyClient(),
    usernameClient(),
    adminClient(),
    organizationClient(),
    twoFactorClient(),
  ],
})
