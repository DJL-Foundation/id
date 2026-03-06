import { createFileRoute, Link } from "@tanstack/react-router";
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

interface ForgotPasswordForm {
	email: string;
}

function ForgotPasswordPage() {
	const id = useId();
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordForm>();

	const onSubmit = async (data: ForgotPasswordForm) => {
		setError("");
		setLoading(true);
		try {
			const result = await authClient.forgetPassword({
				email: data.email,
				redirectTo: "/auth/reset-password",
			});

			if (result.error) {
				setError(result.error.message ?? "Failed to send reset email");
			} else {
				setSuccess(true);
			}
		} catch {
			setError("An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	if (success) {
		return (
			<AuthLayout showBackButton>
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl">Check your email</CardTitle>
						<CardDescription>
							If an account exists with that email, we&apos;ve sent a password
							reset link. Please check your inbox.
						</CardDescription>
					</CardHeader>
					<CardFooter className="justify-center">
						<Link
							to="/auth/sign-in"
							className="text-sm font-medium text-primary hover:underline"
						>
							Back to sign in
						</Link>
					</CardFooter>
				</Card>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout showBackButton>
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">Forgot password</CardTitle>
					<CardDescription>
						Enter your email address and we&apos;ll send you a link to reset
						your password.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						{error && (
							<div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
								{error}
							</div>
						)}
						<div className="space-y-2">
							<Label htmlFor={`${id}-email`}>Email</Label>
							<Input
								id={`${id}-email`}
								type="email"
								placeholder="you@example.com"
								autoComplete="email"
								{...register("email", {
									required: "Email is required",
									pattern: {
										value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
										message: "Enter a valid email address",
									},
								})}
							/>
							{errors.email && (
								<p className="text-sm text-destructive">
									{errors.email.message}
								</p>
							)}
						</div>
						<Button type="submit" className="w-full" disabled={loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Send reset link
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

export const Route = createFileRoute("/auth/forgot-password")({
	component: ForgotPasswordPage,
});
