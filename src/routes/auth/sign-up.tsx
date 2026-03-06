import { Turnstile } from "@marsidev/react-turnstile";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Github, Loader2 } from "lucide-react";
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

interface SignUpForm {
	name: string;
	email: string;
	username: string;
	password: string;
	confirmPassword: string;
}

function SignUpPage() {
	const id = useId();
	const [captchaToken, setCaptchaToken] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<SignUpForm>();

	const password = watch("password");

	const onSubmit = async (data: SignUpForm) => {
		setError("");
		setLoading(true);
		try {
			const result = await authClient.signUp.email({
				name: data.name,
				email: data.email,
				username: data.username,
				password: data.password,
				fetchOptions: {
					headers: {
						"x-captcha-response": captchaToken,
					},
				},
			});

			if (result.error) {
				setError(result.error.message ?? "Sign up failed");
			} else {
				setSuccess(true);
			}
		} catch {
			setError("An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	const handleSocialSignUp = async (provider: "google" | "github") => {
		await authClient.signIn.social({
			provider,
			callbackURL: "/",
		});
	};

	if (success) {
		return (
			<AuthLayout>
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl">Check your email</CardTitle>
						<CardDescription>
							We&apos;ve sent a verification link to your email address. Please
							check your inbox and click the link to verify your account.
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
		<AuthLayout>
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">Create an account</CardTitle>
					<CardDescription>
						Sign up for a DJL Foundation account
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
							<Label htmlFor={`${id}-name`}>Name</Label>
							<Input
								id={`${id}-name`}
								placeholder="John Doe"
								autoComplete="name"
								{...register("name", {
									required: "Name is required",
								})}
							/>
							{errors.name && (
								<p className="text-sm text-destructive">
									{errors.name.message}
								</p>
							)}
						</div>
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
						<div className="space-y-2">
							<Label htmlFor={`${id}-username`}>Username</Label>
							<Input
								id={`${id}-username`}
								placeholder="johndoe"
								autoComplete="username"
								{...register("username", {
									required: "Username is required",
									minLength: {
										value: 3,
										message: "Username must be at least 3 characters",
									},
									pattern: {
										value: /^[a-zA-Z0-9_-]+$/,
										message:
											"Username can only contain letters, numbers, hyphens, and underscores",
									},
								})}
							/>
							{errors.username && (
								<p className="text-sm text-destructive">
									{errors.username.message}
								</p>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor={`${id}-password`}>Password</Label>
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

						<Turnstile
							siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY ?? ""}
							onSuccess={setCaptchaToken}
						/>

						<Button type="submit" className="w-full" disabled={loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Create account
						</Button>
					</form>

					<div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-card px-2 text-muted-foreground">
								Or continue with
							</span>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<Button
							variant="outline"
							onClick={() => handleSocialSignUp("google")}
							type="button"
						>
							<svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
								<title>Google</title>
								<path
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
									fill="#4285F4"
								/>
								<path
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									fill="#34A853"
								/>
								<path
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									fill="#FBBC05"
								/>
								<path
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									fill="#EA4335"
								/>
							</svg>
							Google
						</Button>
						<Button
							variant="outline"
							onClick={() => handleSocialSignUp("github")}
							type="button"
						>
							<Github className="mr-2 h-4 w-4" />
							GitHub
						</Button>
					</div>
				</CardContent>
				<CardFooter className="justify-center">
					<p className="text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link
							to="/auth/sign-in"
							className="font-medium text-primary hover:underline"
						>
							Sign in
						</Link>
					</p>
				</CardFooter>
			</Card>
		</AuthLayout>
	);
}

export const Route = createFileRoute("/auth/sign-up")({
	component: SignUpPage,
});
