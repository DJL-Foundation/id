import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";
import FullLayout from "#/components/layouts/FullLayout";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/admin/organizations")({
	component: AdminOrganizationsPage,
});

function AdminOrganizationsPage() {
	const { data: session, isPending } = authClient.useSession();
	const navigate = useNavigate();

	if (isPending) {
		return (
			<FullLayout>
				<div className="flex items-center justify-center py-20">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
				</div>
			</FullLayout>
		);
	}

	if (!session?.user || (session.user as Record<string, unknown>).role !== "admin") {
		void navigate({ to: "/" });
		return null;
	}

	return (
		<FullLayout>
			<main className="page-wrap px-4 py-12">
				<div className="mx-auto max-w-4xl space-y-6">
					<div>
						<h1 className="text-3xl font-bold">Organization Management</h1>
						<p className="text-muted-foreground">
							View and manage all organizations in the system.
						</p>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Organizations</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
							<p className="text-muted-foreground">
								Organization management is available through the Better Auth
								admin API.
							</p>
						</CardContent>
					</Card>
				</div>
			</main>
		</FullLayout>
	);
}
