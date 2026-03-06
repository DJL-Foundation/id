import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		BETTER_AUTH_SECRET: z.string().min(32).optional(),
		BETTER_AUTH_URL: z.string().url().optional(),
		DATABASE_URL: z.string().url().optional(),
		GITHUB_CLIENT_ID: z.string().min(1).optional(),
		GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
		GOOGLE_CLIENT_ID: z.string().min(1).optional(),
		GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
		RESEND_API_KEY: z.string().min(1).optional(),
		TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
	},

	clientPrefix: "VITE_",

	client: {
		VITE_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
	},

	runtimeEnv: import.meta.env,

	emptyStringAsUndefined: true,
});
