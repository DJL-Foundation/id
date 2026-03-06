import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/user/delete-account")({
	server: {
		handlers: {
			POST: () =>
				new Response("Unimplemented", {
					status: 500,
				}),
		},
	},
});
