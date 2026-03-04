import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'

interface AdminUsersResponse {
  users?: Array<{ id: string; email: string }>
}

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const { data: session, isPending } = authClient.useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [adminUsers, setAdminUsers] = useState<Array<{ id: string; email: string }>>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')

  const pluginClient = authClient as unknown as {
    signIn: {
      passkey: () => Promise<{ error?: { message?: string } }>
      username: (payload: { username: string; password: string }) => Promise<{ error?: { message?: string } }>
    }
    passkey: { addPasskey: (payload: { name: string }) => Promise<{ error?: { message?: string } }> }
    apiKey: {
      create: (payload: { name: string; expiresIn: number }) => Promise<{ error?: { message?: string }; data?: { key?: string } }>
    }
    twoFactor: { enable: (payload: { password: string }) => Promise<{ error?: { message?: string } }> }
    organization: { create: (payload: { name: string; slug: string }) => Promise<{ error?: { message?: string } }> }
  }
  const passkeySignIn = () => pluginClient.signIn.passkey()
  const usernameSignIn = () => pluginClient.signIn.username({ username, password })
  const addPasskey = () =>
    pluginClient.passkey.addPasskey({ name: 'Primary device' })
  const createApiKey = () =>
    pluginClient.apiKey.create({ name: 'Dashboard Access', expiresIn: 14 })
  const enableTwoFactor = () =>
    pluginClient.twoFactor.enable({ password })
  const createOrganization = () =>
    pluginClient.organization.create({ name: 'DJL Workspace', slug: `djl-${Date.now()}` })
  const fallbackName = `DJL User ${Date.now()}`

  if (isPending) {
    return (
      <main className="page-wrap px-4 pb-12 pt-14">
        <section className="island-shell rounded-2xl p-8">Session wird geladen…</section>
      </main>
    )
  }

  if (!session?.user) {
    return (
      <main className="page-wrap px-4 pb-12 pt-14">
        <section className="island-shell rise-in rounded-[2rem] px-6 py-10 sm:px-10">
          <p className="island-kicker mb-3">DJL Foundation</p>
          <h1 className="display-title mb-4 text-4xl font-bold sm:text-6xl">
            Authentication Provider
          </h1>
          <p className="max-w-2xl text-[var(--sea-ink-soft)]">
            Diese Instanz ist der zentrale Identity Provider der DJL Foundation.
            Im ausgeloggten Zustand ist ausschließlich diese Startseite erreichbar.
          </p>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <form
            className="island-shell rounded-2xl p-6"
            onSubmit={(event) => {
              event.preventDefault()
              void authClient.signIn
                .email({
                  email,
                  password,
                })
                .then((result) => {
                  setStatus(result.error ? result.error.message : 'Anmeldung erfolgreich.')
                })
            }}
          >
            <p className="island-kicker mb-2">Mail & Passwort</p>
            <input
              className="mb-2 w-full rounded-lg border border-[var(--line)] bg-white/80 px-3 py-2"
              placeholder="E-Mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <input
              className="mb-3 w-full rounded-lg border border-[var(--line)] bg-white/80 px-3 py-2"
              placeholder="Passwort"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button type="submit" className="rounded-full bg-[var(--palm)] px-4 py-2 text-white">
              Anmelden
            </button>
          </form>

          <form
            className="island-shell rounded-2xl p-6"
            onSubmit={(event) => {
              event.preventDefault()
              void authClient.signUp
                .email({
                  email,
                  password,
                  name: displayName || username || fallbackName,
                  username,
                })
                .then((result) => {
                  setStatus(result.error ? result.error.message : 'Registrierung gestartet.')
                })
            }}
          >
            <p className="island-kicker mb-2">Neues Konto</p>
            <input
              className="mb-2 w-full rounded-lg border border-[var(--line)] bg-white/80 px-3 py-2"
              placeholder="Anzeigename"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
            <input
              className="mb-2 w-full rounded-lg border border-[var(--line)] bg-white/80 px-3 py-2"
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <button type="submit" className="rounded-full bg-[var(--lagoon-deep)] px-4 py-2 text-white">
              Registrieren
            </button>
          </form>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            className="island-shell rounded-2xl p-4 text-left"
            onClick={() => {
              void authClient.signIn.social({ provider: 'google' })
            }}
          >
            Google OAuth
          </button>
          <button
            type="button"
            className="island-shell rounded-2xl p-4 text-left"
            onClick={() => {
              void authClient.signIn.social({ provider: 'github' })
            }}
          >
            GitHub OAuth
          </button>
          <button
            type="button"
            className="island-shell rounded-2xl p-4 text-left"
            onClick={() => {
              void passkeySignIn().then((result) => {
                setStatus(result?.error?.message ?? 'Passkey-Login gestartet.')
              })
            }}
          >
            Passkey Login
          </button>
          <button
            type="button"
            className="island-shell rounded-2xl p-4 text-left"
            onClick={() => {
              void usernameSignIn().then((result) => {
                setStatus(result?.error?.message ?? 'Username-Login erfolgreich.')
              })
            }}
          >
            Username Login
          </button>
        </section>

        {status ? <p className="mt-4 text-sm text-[var(--sea-ink-soft)]">{status}</p> : null}
      </main>
    )
  }

  return (
    <main className="page-wrap px-4 pb-12 pt-14">
      <section className="island-shell rounded-[2rem] px-6 py-10 sm:px-10">
        <p className="island-kicker mb-3">Dashboard</p>
        <h1 className="display-title mb-2 text-4xl font-bold sm:text-5xl">
          Willkommen, {session.user.name || session.user.email}
        </h1>
        <p className="text-[var(--sea-ink-soft)]">
          Session: {session.session.id.slice(0, 8)} • User ID: {session.user.id.slice(0, 8)}
        </p>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="island-shell rounded-2xl p-5">
          <p className="island-kicker mb-2">Account</p>
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Neuer Anzeigename"
            className="mb-2 w-full rounded-lg border border-[var(--line)] bg-white/80 px-3 py-2"
          />
          <button
            type="button"
            className="rounded-full bg-[var(--lagoon-deep)] px-4 py-2 text-white"
            onClick={() => {
              void authClient.updateUser({ name: displayName }).then((result) => {
                setStatus(result.error ? result.error.message : 'Account aktualisiert.')
              })
            }}
          >
            Account aktualisieren
          </button>
          <button
            type="button"
            className="ml-2 rounded-full border border-red-600 px-4 py-2 text-red-600"
            onClick={() => {
              void fetch('/api/user/delete-account', { method: 'DELETE' })
                .then(async (response) => {
                  const body = await response.text()
                  if (!response.ok) {
                    setStatus(`Löschen fehlgeschlagen (${response.status}): ${body}`)
                    return
                  }
                  setStatus(body)
                })
                .catch(() => {
                  setStatus('Löschen fehlgeschlagen (Netzwerkfehler).')
                })
            }}
          >
            Account löschen
          </button>
        </article>

        <article className="island-shell rounded-2xl p-5">
          <p className="island-kicker mb-2">Plugins</p>
          <div className="space-y-2">
            <button
              type="button"
              className="rounded-full bg-[var(--palm)] px-4 py-2 text-white"
              onClick={() => {
                void addPasskey().then((result) => {
                  setStatus(result?.error?.message ?? 'Passkey hinzugefügt.')
                })
              }}
            >
              Passkey hinzufügen
            </button>
            <button
              type="button"
              className="rounded-full bg-[var(--palm)] px-4 py-2 text-white"
              onClick={() => {
                void createApiKey().then((result) => {
                    if (result?.data?.key) {
                      setApiKey(result.data.key)
                    }
                    setStatus(result?.error?.message ?? 'API Key erstellt.')
                  })
              }}
            >
              API Key erstellen
            </button>
            <button
              type="button"
              className="rounded-full bg-[var(--palm)] px-4 py-2 text-white"
              onClick={() => {
                void enableTwoFactor().then((result) => {
                  setStatus(result?.error?.message ?? '2FA aktiviert.')
                })
              }}
            >
              2FA aktivieren
            </button>
            <button
              type="button"
              className="rounded-full bg-[var(--palm)] px-4 py-2 text-white"
              onClick={() => {
                void createOrganization().then((result) => {
                  setStatus(result?.error?.message ?? 'Organisation erstellt.')
                })
              }}
            >
              Organisation erstellen
            </button>
          </div>
        </article>

        <article className="island-shell rounded-2xl p-5">
          <p className="island-kicker mb-2">Admin & API</p>
          {adminUsers.length > 0 ? (
            <select
              className="mb-2 w-full rounded-lg border border-[var(--line)] bg-white/80 px-3 py-2"
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
            >
              {adminUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </select>
          ) : null}
          <div className="space-y-2 text-sm">
            <button
              type="button"
              className="rounded-full bg-[var(--lagoon)] px-4 py-2 text-[var(--sea-ink)]"
              onClick={() => {
                void fetch('/api/auth/admin/list-users')
                  .then((response) => response.json())
                  .then((users) => {
                    const response = users as AdminUsersResponse
                    const normalized = (response.users ?? []).map((user) => ({
                      id: user.id,
                      email: user.email,
                    }))
                    setAdminUsers(normalized)
                    if (normalized[0]?.id) {
                      setSelectedUserId(normalized[0].id)
                    }
                    setStatus(`Users geladen: ${normalized.length}`)
                  })
              }}
            >
              Users listen
            </button>
            <button
              type="button"
              className="rounded-full bg-[var(--lagoon)] px-4 py-2 text-[var(--sea-ink)]"
              onClick={() => {
                void fetch('/api/auth/admin/impersonate-user', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({ userId: selectedUserId || session.user.id }),
                }).then(() => setStatus('Impersonation-Request gesendet.'))
              }}
            >
              Impersonate
            </button>
            <button
              type="button"
              className="rounded-full bg-[var(--lagoon)] px-4 py-2 text-[var(--sea-ink)]"
              onClick={() => {
                void fetch('/api/auth/admin/update-user', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({
                    userId: selectedUserId || session.user.id,
                    data: { name: displayName },
                  }),
                }).then(() => setStatus('Admin update ausgelöst.'))
              }}
            >
              Admin Edit
            </button>
            <button
              type="button"
              className="rounded-full border border-red-600 px-4 py-2 text-red-600"
              onClick={() => {
                void fetch('/api/auth/admin/remove-user', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({ userId: selectedUserId || session.user.id }),
                }).then(() => setStatus('Admin delete ausgelöst.'))
              }}
            >
              Admin Delete
            </button>
            <a href="/api/auth/openapi" className="block underline">
              OpenAPI Reference
            </a>
            <a href="/api/auth/open-api/generate-schema" className="block underline">
              OpenAPI Schema
            </a>
          </div>
        </article>
      </section>

      {apiKey ? (
        <section className="island-shell mt-6 rounded-2xl p-5">
          <p className="island-kicker mb-2">Neuer API Key</p>
          <code>{apiKey}</code>
        </section>
      ) : null}

      {status ? <p className="mt-4 text-sm text-[var(--sea-ink-soft)]">{status}</p> : null}
    </main>
  )
}
