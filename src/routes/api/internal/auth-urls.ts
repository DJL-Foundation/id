import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'

function getApiKey(request: Request) {
  const header = request.headers.get('x-api-key')
  return header ?? ''
}

export const Route = createFileRoute('/api/internal/auth-urls')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const key = getApiKey(request)
        if (!key) {
          return new Response(JSON.stringify({ error: 'Missing API key' }), {
            status: 401,
            headers: { 'content-type': 'application/json' },
          })
        }

        const verification = await auth.api.verifyApiKey({
          body: { key },
          headers: request.headers,
        })

        if (!verification.valid) {
          return new Response(JSON.stringify({ error: 'Invalid API key' }), {
            status: 401,
            headers: { 'content-type': 'application/json' },
          })
        }

        const baseAuthPath = '/api/auth'
        return new Response(
          JSON.stringify({
            openapiSchema: `${baseAuthPath}/open-api/generate-schema`,
            openapiReference: `${baseAuthPath}/openapi`,
            session: `${baseAuthPath}/get-session`,
            signIn: `${baseAuthPath}/sign-in/email`,
            signOut: `${baseAuthPath}/sign-out`,
            usersList: `${baseAuthPath}/admin/list-users`,
          }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          },
        )
      },
    },
  },
})
