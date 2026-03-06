import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { authClient } from "#/lib/auth-client";
import FullLayout from "#/components/layouts/FullLayout";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Badge } from "#/components/ui/badge";
import { Separator } from "#/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import { Trash2, UserCog, Eye, Search } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
	component: AdminUsersPage,
});

function AdminUsersPage() {
	const { data: session, isPending } = authClient.useSession();
	const navigate = useNavigate();
	const [users, setUsers] = useState<
		Array<{
			id: string;
			name: string;
			email: string;
			role: string;
			emailVerified: boolean;
			createdAt: string;
		}>
	>([]);
	const [search, setSearch] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (session?.user && (session.user as Record<string, unknown>).role === "admin") {
			void loadUsers();
		}
	}, [session]);

	const loadUsers = async () => {
		setIsLoading(true);
		try {
			const result = await authClient.admin.listUsers({
				query: { limit: 100 },
			});
			if (result.data) {
				setUsers(
					(result.data.users as Array<Record<string, unknown>>).map(
						(u) => ({
							id: String(u.id ?? ""),
							name: String(u.name ?? ""),
							email: String(u.email ?? ""),
							role: String(u.role ?? "user"),
							emailVerified: Boolean(u.emailVerified),
							createdAt: String(u.createdAt ?? ""),
						}),
					),
				);
			}
		} catch {
			// ignore
		} finally {
			setIsLoading(false);
		}
	};

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

	const filteredUsers = users.filter(
		(u) =>
			u.name.toLowerCase().includes(search.toLowerCase()) ||
			u.email.toLowerCase().includes(search.toLowerCase()),
	);

	const handleImpersonate = async (userId: string) => {
		try {
			await authClient.admin.impersonateUser({ userId });
			void navigate({ to: "/" });
		} catch {
			// ignore
		}
	};

	const handleDelete = async (userId: string) => {
		if (!confirm("Are you sure you want to delete this user?")) return;
		try {
			await authClient.admin.removeUser({ userId });
			await loadUsers();
		} catch {
			// ignore
		}
	};

	return (
		<FullLayout>
			<main className="page-wrap px-4 py-12">
				<div className="mx-auto max-w-5xl space-y-6">
					<div>
						<h1 className="text-3xl font-bold">User Management</h1>
						<p className="text-muted-foreground">
							View, edit, delete, and impersonate users.
						</p>
					</div>

					<div className="flex items-center gap-2">
						<Search className="h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search users..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="max-w-sm"
						/>
						<Button onClick={loadUsers} variant="outline" disabled={isLoading}>
							{isLoading ? "Loading..." : "Refresh"}
						</Button>
					</div>

					<Separator />

					<Card>
						<CardHeader>
							<CardTitle>Users ({filteredUsers.length})</CardTitle>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>Verified</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredUsers.map((user) => (
										<TableRow key={user.id}>
											<TableCell className="font-medium">
												{user.name}
											</TableCell>
											<TableCell>{user.email}</TableCell>
											<TableCell>
												<Badge
													variant={
														user.role === "admin"
															? "default"
															: "secondary"
													}
												>
													{user.role}
												</Badge>
											</TableCell>
											<TableCell>
												<Badge
													variant={
														user.emailVerified
															? "default"
															: "outline"
													}
												>
													{user.emailVerified ? "Yes" : "No"}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-1">
													<Button
														variant="ghost"
														size="sm"
														onClick={() =>
															handleImpersonate(user.id)
														}
														title="Impersonate"
													>
														<Eye className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														title="Edit"
													>
														<UserCog className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() =>
															handleDelete(user.id)
														}
														title="Delete"
														className="text-destructive hover:text-destructive"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
									{filteredUsers.length === 0 && (
										<TableRow>
											<TableCell
												colSpan={5}
												className="text-center text-muted-foreground"
											>
												No users found.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>
			</main>
		</FullLayout>
	);
}
