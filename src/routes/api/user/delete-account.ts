import { createFileRoute } from '@tanstack/react-router'

export function createUnimplementedDeleteResponse() {
  return new Response('Unimplemented', {
    status: 500,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}

export const Route = createFileRoute('/api/user/delete-account')({
  server: {
    handlers: {
      DELETE: () => createUnimplementedDeleteResponse(),
    },
  },
})
