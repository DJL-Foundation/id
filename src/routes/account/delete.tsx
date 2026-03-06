import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { authClient } from "#/lib/auth-client";
import FullLayout from "#/components/layouts/FullLayout";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/account/delete")({
	component: DeleteAccountPage,
});

function DeleteAccountPage() {
	const { data: session, isPending } = authClient.useSession();
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const { register, handleSubmit, watch } = useForm<{ confirmEmail: string }>();

	if (isPending) {
		return (
			<FullLayout>
				<div className="flex items-center justify-center py-20">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-destructive" />
				</div>
			</FullLayout>
		);
	}

	if (!session?.user) {
		void navigate({ to: "/auth/sign-in" });
		return null;
	}

	const emailMatch = watch("confirmEmail") === session.user.email;

	const onSubmit = async () => {
		setIsDeleting(true);
		setError(null);
		try {
			await authClient.deleteUser();
		} catch (e) {
			setError(
				"Account deletion is not yet implemented. The identity provider needs to broadcast this deletion to all connected applications first.",
			);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<FullLayout>
			<main className="page-wrap px-4 py-12">
				<Card className="mx-auto max-w-lg border-destructive/50">
					<CardHeader>
						<div className="flex items-center gap-3">
							<AlertTriangle className="h-6 w-6 text-destructive" />
							<CardTitle className="text-destructive">Delete Account</CardTitle>
						</div>
						<CardDescription>
							This action is permanent and cannot be undone. All your data will
							be removed from all connected applications.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="confirmEmail">
									Type <strong>{session.user.email}</strong> to confirm
								</Label>
								<Input
									id="confirmEmail"
									{...register("confirmEmail", { required: true })}
									placeholder="your@email.com"
								/>
							</div>
							{error && (
								<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
									{error}
								</div>
							)}
							<Button
								type="submit"
								variant="destructive"
								disabled={!emailMatch || isDeleting}
								className="w-full"
							>
								{isDeleting ? "Deleting..." : "Delete My Account"}
							</Button>
						</form>
					</CardContent>
				</Card>
			</main>
		</FullLayout>
	);
}
