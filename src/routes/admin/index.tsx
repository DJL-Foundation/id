import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";
import FullLayout from "#/components/layouts/FullLayout";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Users, Building2, Shield } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
	component: AdminDashboard,
});

function AdminDashboard() {
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

	if (!session?.user) {
		void navigate({ to: "/auth/sign-in" });
		return null;
	}

	if ((session.user as Record<string, unknown>).role !== "admin") {
		void navigate({ to: "/" });
		return null;
	}

	return (
		<FullLayout>
			<main className="page-wrap px-4 py-12">
				<div className="mx-auto max-w-4xl space-y-6">
					<div>
						<h1 className="text-3xl font-bold">Admin Dashboard</h1>
						<p className="text-muted-foreground">
							Manage users, organizations, and system settings.
						</p>
					</div>

					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<Link to="/admin/users">
							<Card className="transition-shadow hover:shadow-lg">
								<CardHeader>
									<Users className="h-8 w-8 text-primary" />
									<CardTitle>User Management</CardTitle>
									<CardDescription>
										List, edit, delete, and impersonate users.
									</CardDescription>
								</CardHeader>
							</Card>
						</Link>

						<Link to="/admin/organizations">
							<Card className="transition-shadow hover:shadow-lg">
								<CardHeader>
									<Building2 className="h-8 w-8 text-primary" />
									<CardTitle>Organizations</CardTitle>
									<CardDescription>
										Manage all organizations in the system.
									</CardDescription>
								</CardHeader>
							</Card>
						</Link>

						<a href="/api/auth/reference" target="_blank" rel="noreferrer">
							<Card className="transition-shadow hover:shadow-lg">
								<CardHeader>
									<Shield className="h-8 w-8 text-primary" />
									<CardTitle>OpenAPI Reference</CardTitle>
									<CardDescription>
										View the full API documentation.
									</CardDescription>
								</CardHeader>
							</Card>
						</a>
					</div>
				</div>
			</main>
		</FullLayout>
	);
}
