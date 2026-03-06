import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import AuthLayout from "#/components/layouts/AuthLayout";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { authClient } from "#/lib/auth-client";

interface ResetPasswordForm {
	password: string;
	confirmPassword: string;
}

function ResetPasswordPage() {
	const id = useId();
	const router = useRouter();
	const searchParams = new URLSearchParams(window.location.search);
	const token = searchParams.get("token") ?? "";

	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<ResetPasswordForm>();

	const password = watch("password");

	const onSubmit = async (data: ResetPasswordForm) => {
		if (!token) {
			setError("Invalid or missing reset token");
			return;
		}

		setError("");
		setLoading(true);
		try {
			const result = await authClient.resetPassword({
				newPassword: data.password,
				token,
			});

			if (result.error) {
				setError(result.error.message ?? "Failed to reset password");
			} else {
				router.navigate({ to: "/auth/sign-in" });
			}
		} catch {
			setError("An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthLayout>
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">Reset password</CardTitle>
					<CardDescription>Enter your new password below.</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						{error && (
							<div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
								{error}
							</div>
						)}
						<div className="space-y-2">
							<Label htmlFor={`${id}-password`}>New Password</Label>
							<Input
								id={`${id}-password`}
								type="password"
								placeholder="••••••••"
								autoComplete="new-password"
								{...register("password", {
									required: "Password is required",
									minLength: {
										value: 8,
										message: "Password must be at least 8 characters",
									},
								})}
							/>
							{errors.password && (
								<p className="text-sm text-destructive">
									{errors.password.message}
								</p>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor={`${id}-confirmPassword`}>Confirm Password</Label>
							<Input
								id={`${id}-confirmPassword`}
								type="password"
								placeholder="••••••••"
								autoComplete="new-password"
								{...register("confirmPassword", {
									required: "Please confirm your password",
									validate: (value) =>
										value === password || "Passwords do not match",
								})}
							/>
							{errors.confirmPassword && (
								<p className="text-sm text-destructive">
									{errors.confirmPassword.message}
								</p>
							)}
						</div>
						<Button type="submit" className="w-full" disabled={loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Reset password
						</Button>
					</form>
				</CardContent>
				<CardFooter className="justify-center">
					<Link
						to="/auth/sign-in"
						className="text-sm text-muted-foreground hover:underline"
					>
						Back to sign in
					</Link>
				</CardFooter>
			</Card>
		</AuthLayout>
	);
}

export const Route = createFileRoute("/auth/reset-password")({
	component: ResetPasswordPage,
});
