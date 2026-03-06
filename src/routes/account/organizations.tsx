import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { authClient } from "#/lib/auth-client";
import FullLayout from "#/components/layouts/FullLayout";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Badge } from "#/components/ui/badge";
import { Separator } from "#/components/ui/separator";
import { Building2, Plus, LogOut } from "lucide-react";

export const Route = createFileRoute("/account/organizations")({
	component: OrganizationsPage,
});

function OrganizationsPage() {
	const { data: session, isPending } = authClient.useSession();
	const navigate = useNavigate();
	const [orgs, setOrgs] = useState<
		Array<{ id: string; name: string; slug: string; role: string }>
	>([]);
	const [showCreate, setShowCreate] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { register, handleSubmit, reset } = useForm<{
		name: string;
		slug: string;
	}>();

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

	const loadOrgs = async () => {
		try {
			const result = await authClient.organization.listOrganizations();
			if (result.data) {
				setOrgs(
					result.data.map((o: Record<string, unknown>) => ({
						id: String(o.id ?? ""),
						name: String(o.name ?? ""),
						slug: String(o.slug ?? ""),
						role: String(o.role ?? "member"),
					})),
				);
			}
		} catch {
			// ignore
		}
	};

	const onCreate = async (data: { name: string; slug: string }) => {
		setIsLoading(true);
		try {
			await authClient.organization.create({
				name: data.name,
				slug: data.slug,
			});
			reset();
			setShowCreate(false);
			await loadOrgs();
		} catch {
			// ignore
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<FullLayout>
			<main className="page-wrap px-4 py-12">
				<div className="mx-auto max-w-2xl space-y-6">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold">Organizations</h1>
						<Button onClick={() => setShowCreate(!showCreate)} size="sm">
							<Plus className="mr-2 h-4 w-4" />
							Create Organization
						</Button>
					</div>

					{showCreate && (
						<Card>
							<CardHeader>
								<CardTitle>Create Organization</CardTitle>
								<CardDescription>
									Create a new organization and invite members.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form
									onSubmit={handleSubmit(onCreate)}
									className="space-y-4"
								>
									<div className="space-y-2">
										<Label htmlFor="orgName">Name</Label>
										<Input
											id="orgName"
											{...register("name", { required: true })}
											placeholder="My Organization"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="orgSlug">Slug</Label>
										<Input
											id="orgSlug"
											{...register("slug", { required: true })}
											placeholder="my-organization"
										/>
									</div>
									<Button type="submit" disabled={isLoading}>
										{isLoading ? "Creating..." : "Create"}
									</Button>
								</form>
							</CardContent>
						</Card>
					)}

					<Separator />

					{orgs.length === 0 ? (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-12">
								<Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
								<p className="text-muted-foreground">
									You are not a member of any organization yet.
								</p>
								<Button
									variant="outline"
									className="mt-4"
									onClick={loadOrgs}
								>
									Refresh
								</Button>
							</CardContent>
						</Card>
					) : (
						<div className="space-y-3">
							{orgs.map((org) => (
								<Card key={org.id}>
									<CardContent className="flex items-center justify-between py-4">
										<div className="flex items-center gap-3">
											<Building2 className="h-5 w-5 text-muted-foreground" />
											<div>
												<Link
													to="/org/$orgId"
													params={{ orgId: org.id }}
													className="font-medium hover:underline"
												>
													{org.name}
												</Link>
												<p className="text-sm text-muted-foreground">
													/{org.slug}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Badge variant="secondary">{org.role}</Badge>
											<Button variant="ghost" size="sm">
												<LogOut className="h-4 w-4" />
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>
			</main>
		</FullLayout>
	);
}
