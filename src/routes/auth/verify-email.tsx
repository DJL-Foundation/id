import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
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
import { authClient } from "#/lib/auth-client";

function VerifyEmailPage() {
	const searchParams = new URLSearchParams(window.location.search);
	const token = searchParams.get("token") ?? "";

	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading",
	);
	const [error, setError] = useState<string>("");

	useEffect(() => {
		if (!token) {
			setError("Invalid or missing verification token");
			setStatus("error");
			return;
		}

		authClient
			.verifyEmail({ query: { token } })
			.then((result) => {
				if (result.error) {
					setError(result.error.message ?? "Email verification failed");
					setStatus("error");
				} else {
					setStatus("success");
				}
			})
			.catch(() => {
				setError("An unexpected error occurred");
				setStatus("error");
			});
	}, [token]);

	return (
		<AuthLayout>
			<Card className="w-full max-w-md">
				{status === "loading" && (
					<>
						<CardHeader className="text-center">
							<CardTitle className="text-2xl">Verifying email</CardTitle>
							<CardDescription>
								Please wait while we verify your email address...
							</CardDescription>
						</CardHeader>
						<CardContent className="flex justify-center py-8">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</CardContent>
					</>
				)}

				{status === "success" && (
					<>
						<CardHeader className="text-center">
							<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
								<CheckCircle className="h-6 w-6 text-green-600" />
							</div>
							<CardTitle className="text-2xl">Email verified</CardTitle>
							<CardDescription>
								Your email has been successfully verified. You can now sign in
								to your account.
							</CardDescription>
						</CardHeader>
						<CardFooter className="justify-center">
							<Button asChild>
								<Link to="/auth/sign-in">Sign in</Link>
							</Button>
						</CardFooter>
					</>
				)}

				{status === "error" && (
					<>
						<CardHeader className="text-center">
							<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
								<XCircle className="h-6 w-6 text-destructive" />
							</div>
							<CardTitle className="text-2xl">Verification failed</CardTitle>
							<CardDescription>{error}</CardDescription>
						</CardHeader>
						<CardFooter className="justify-center">
							<Link
								to="/auth/sign-in"
								className="text-sm font-medium text-primary hover:underline"
							>
								Back to sign in
							</Link>
						</CardFooter>
					</>
				)}
			</Card>
		</AuthLayout>
	);
}

export const Route = createFileRoute("/auth/verify-email")({
	component: VerifyEmailPage,
});
