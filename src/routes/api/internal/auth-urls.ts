import { createFileRoute } from "@tanstack/react-router";
import { auth } from "#/lib/auth";

export const Route = createFileRoute("/api/internal/auth-urls")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const header = request.headers.get("Authorization");
				if (!header?.startsWith("Bearer ")) {
					return new Response("Unauthorized", { status: 401 });
				}

				const key = header.slice(7);
				const result = await auth.api.verifyApiKey({
					body: { key },
				});

				if (!result?.valid) {
					return new Response("Unauthorized", { status: 401 });
				}

				const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

				return Response.json({
					signIn: `${base}/api/auth/sign-in/email`,
					signUp: `${base}/api/auth/sign-up/email`,
					signOut: `${base}/api/auth/sign-out`,
					session: `${base}/api/auth/get-session`,
					user: `${base}/api/auth/get-session`,
					forgotPassword: `${base}/api/auth/forget-password`,
					resetPassword: `${base}/api/auth/reset-password`,
					verifyEmail: `${base}/api/auth/verify-email`,
					socialSignIn: `${base}/api/auth/sign-in/social`,
					twoFactorVerify: `${base}/api/auth/two-factor/verify-totp`,
				});
			},
		},
	},
});
