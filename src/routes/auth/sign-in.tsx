import { Turnstile } from "@marsidev/react-turnstile";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Fingerprint, Github, Loader2 } from "lucide-react";
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

interface SignInForm {
	email: string;
	password: string;
}

interface TotpForm {
	code: string;
}

function SignInPage() {
	const id = useId();
	const router = useRouter();
	const [captchaToken, setCaptchaToken] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [showTotp, setShowTotp] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignInForm>();

	const {
		register: registerTotp,
		handleSubmit: handleTotpSubmit,
		formState: { errors: totpErrors },
	} = useForm<TotpForm>();

	const onSubmit = async (data: SignInForm) => {
		setError("");
		setLoading(true);
		try {
			const result = await authClient.signIn.email({
				email: data.email,
				password: data.password,
				fetchOptions: {
					headers: {
						"x-captcha-response": captchaToken,
					},
				},
			});

			if ((result.data as Record<string, unknown> | null)?.twoFactorRedirect) {
				setShowTotp(true);
				setLoading(false);
				return;
			}

			if (result.error) {
				setError(result.error.message ?? "Sign in failed");
			} else {
				router.navigate({ to: "/" });
			}
		} catch {
			setError("An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	const onTotpSubmit = async (data: TotpForm) => {
		setError("");
		setLoading(true);
		try {
			const result = await authClient.twoFactor.verifyTotp({
				code: data.code,
			});

			if (result.error) {
				setError(result.error.message ?? "Invalid TOTP code");
			} else {
				router.navigate({ to: "/" });
			}
		} catch {
			setError("An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	const handleSocialLogin = async (provider: "google" | "github") => {
		await authClient.signIn.social({
			provider,
			callbackURL: "/",
		});
	};

	const handlePasskeyLogin = async () => {
		setError("");
		setLoading(true);
		try {
			const result = await authClient.signIn.passkey();
			if (result?.error) {
				setError(result.error.message ?? "Passkey sign in failed");
			} else {
				router.navigate({ to: "/" });
			}
		} catch {
			setError("Passkey authentication failed");
		} finally {
			setLoading(false);
		}
	};

	if (showTotp) {
		return (
			<AuthLayout>
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl">
							Two-Factor Authentication
						</CardTitle>
						<CardDescription>
							Enter the 6-digit code from your authenticator app
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={handleTotpSubmit(onTotpSubmit)}
							className="space-y-4"
						>
							{error && (
								<div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
									{error}
								</div>
							)}
							<div className="space-y-2">
								<Label htmlFor={`${id}-code`}>Verification Code</Label>
								<Input
									id={`${id}-code`}
									placeholder="000000"
									maxLength={6}
									autoComplete="one-time-code"
									{...registerTotp("code", {
										required: "Code is required",
										pattern: {
											value: /^\d{6}$/,
											message: "Code must be 6 digits",
										},
									})}
								/>
								{totpErrors.code && (
									<p className="text-sm text-destructive">
										{totpErrors.code.message}
									</p>
								)}
							</div>
							<Button type="submit" className="w-full" disabled={loading}>
								{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Verify
							</Button>
						</form>
					</CardContent>
					<CardFooter className="justify-center">
						<Button
							variant="ghost"
							onClick={() => {
								setShowTotp(false);
								setError("");
							}}
						>
							Back to sign in
						</Button>
					</CardFooter>
				</Card>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout>
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">Welcome back</CardTitle>
					<CardDescription>
						Sign in to your DJL Foundation account
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
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor={`${id}-password`}>Password</Label>
								<Link
									to="/auth/forgot-password"
									className="text-sm text-muted-foreground hover:underline"
								>
									Forgot password?
								</Link>
							</div>
							<Input
								id={`${id}-password`}
								type="password"
								placeholder="••••••••"
								autoComplete="current-password"
								{...register("password", {
									required: "Password is required",
								})}
							/>
							{errors.password && (
								<p className="text-sm text-destructive">
									{errors.password.message}
								</p>
							)}
						</div>

						<Turnstile
							siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY ?? ""}
							onSuccess={setCaptchaToken}
						/>

						<Button type="submit" className="w-full" disabled={loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Sign in
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
							onClick={() => handleSocialLogin("google")}
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
							onClick={() => handleSocialLogin("github")}
							type="button"
						>
							<Github className="mr-2 h-4 w-4" />
							GitHub
						</Button>
					</div>

					<Button
						variant="outline"
						className="mt-3 w-full"
						onClick={handlePasskeyLogin}
						type="button"
					>
						<Fingerprint className="mr-2 h-4 w-4" />
						Sign in with Passkey
					</Button>
				</CardContent>
				<CardFooter className="justify-center">
					<p className="text-sm text-muted-foreground">
						Don&apos;t have an account?{" "}
						<Link
							to="/auth/sign-up"
							className="font-medium text-primary hover:underline"
						>
							Create account
						</Link>
					</p>
				</CardFooter>
			</Card>
		</AuthLayout>
	);
}

export const Route = createFileRoute("/auth/sign-in")({
	component: SignInPage,
});
