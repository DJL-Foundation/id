import { apiKey } from "@better-auth/api-key";
import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { captcha, lastLoginMethod, openAPI } from "better-auth/plugins";
import { admin } from "better-auth/plugins/admin";
import { haveIBeenPwned } from "better-auth/plugins/haveibeenpwned";
import { jwt } from "better-auth/plugins/jwt";
import { organization } from "better-auth/plugins/organization";
import { twoFactor } from "better-auth/plugins/two-factor";
import { username } from "better-auth/plugins/username";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import {
	sendPasswordResetEmail,
	sendVerificationEmail,
} from "#/lib/auth-emails";
import { prisma } from "#/lib/prisma";

const socialProviders = {
	...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
		? {
				google: {
					clientId: process.env.GOOGLE_CLIENT_ID,
					clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				},
			}
		: {}),
	...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
		? {
				github: {
					clientId: process.env.GITHUB_CLIENT_ID,
					clientSecret: process.env.GITHUB_CLIENT_SECRET,
				},
			}
		: {}),
};

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL,
	secret: process.env.BETTER_AUTH_SECRET,
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }) => {
			await sendPasswordResetEmail(user.email, user.name, url);
		},
	},
	emailVerification: {
		sendVerificationEmail: async ({ user, url }) => {
			await sendVerificationEmail(user.email, user.name, url);
		},
		sendOnSignUp: true,
	},
	socialProviders,
	user: {
		deleteUser: {
			enabled: true,
		},
	},
	databaseHooks: {
		user: {
			delete: {
				before: async (user, _ctx) => {
					const baseURL =
						process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
					try {
						await fetch(`${baseURL}/api/user/delete-account`, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ userId: user.id }),
						});
					} catch (error) {
						console.error("Failed to call delete-account endpoint:", error);
					}
				},
			},
		},
	},
	plugins: [
		tanstackStartCookies(),
		username(),
		twoFactor({
			issuer: "DJL Foundation ID",
			totpOptions: {
				period: 30,
				digits: 6,
			},
		}),
		passkey({
			rpName: "DJL Foundation ID",
			rpID: process.env.BETTER_AUTH_URL
				? new URL(process.env.BETTER_AUTH_URL).hostname
				: "localhost",
		}),
		admin(),
		openAPI(),
		apiKey(),
		organization(),
		...(process.env.TURNSTILE_SECRET_KEY
			? [
					captcha({
						provider: "cloudflare-turnstile",
						secretKey: process.env.TURNSTILE_SECRET_KEY,
					}),
				]
			: []),
		haveIBeenPwned(),
		jwt(),
		lastLoginMethod(),
	],
});

export type Session = typeof auth.$Infer.Session;
