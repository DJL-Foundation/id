import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	Fingerprint,
	Github,
	Key,
	Link2,
	Loader2,
	Plus,
	Trash2,
	Unlink,
	User,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import FullLayout from "#/components/layouts/FullLayout";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Badge } from "#/components/ui/badge";
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
import { Separator } from "#/components/ui/separator";
import { authClient } from "#/lib/auth-client";

interface ProfileForm {
	name: string;
	username: string;
}

interface PasswordForm {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}

interface ApiKeyForm {
	name: string;
}

function AccountPage() {
	const id = useId();
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	const [profileError, setProfileError] = useState("");
	const [profileSuccess, setProfileSuccess] = useState("");
	const [profileLoading, setProfileLoading] = useState(false);

	const [passwordError, setPasswordError] = useState("");
	const [passwordSuccess, setPasswordSuccess] = useState("");
	const [passwordLoading, setPasswordLoading] = useState(false);

	const [linkLoading, setLinkLoading] = useState("");
	const [linkError, setLinkError] = useState("");

	const [passkeys, setPasskeys] = useState<Array<{ id: string; name?: string; createdAt?: string }>>([]);
	const [passkeyLoading, setPasskeyLoading] = useState(false);
	const [passkeyError, setPasskeyError] = useState("");

	const [apiKeys, setApiKeys] = useState<Array<{ id: string; name: string | null; key?: string; createdAt?: string }>>([]);
	const [apiKeyLoading, setApiKeyLoading] = useState(false);
	const [apiKeyError, setApiKeyError] = useState("");
	const [newKeyValue, setNewKeyValue] = useState("");

	const isAdmin = session?.user?.role === "admin";

	const {
		register: registerProfile,
		handleSubmit: handleProfileSubmit,
		formState: { errors: profileErrors },
		reset: resetProfile,
	} = useForm<ProfileForm>();

	const {
		register: registerPassword,
		handleSubmit: handlePasswordSubmit,
		formState: { errors: passwordErrors },
		reset: resetPassword,
	} = useForm<PasswordForm>();

	const {
		register: registerApiKey,
		handleSubmit: handleApiKeySubmit,
		formState: { errors: apiKeyErrors },
		reset: resetApiKey,
	} = useForm<ApiKeyForm>();

	useEffect(() => {
		if (!isPending && !session) {
			void navigate({ to: "/auth/sign-in" });
		}
	}, [isPending, session, navigate]);

	useEffect(() => {
		if (session?.user) {
			resetProfile({
				name: session.user.name ?? "",
				username: (session.user as Record<string, unknown>).username as string ?? "",
			});
		}
	}, [session, resetProfile]);

	useEffect(() => {
		if (session) {
			void loadPasskeys();
			if (isAdmin) {
				void loadApiKeys();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session, isAdmin]);

	const loadPasskeys = async () => {
		try {
			const result = await authClient.passkey.listPasskeys();
			if (result.data) {
				setPasskeys(result.data as Array<{ id: string; name?: string; createdAt?: string }>);
			}
		} catch {
			// Passkeys may not be available
		}
	};

	const loadApiKeys = async () => {
		try {
			const result = await authClient.apiKey.listKeys();
			if (result.data) {
				setApiKeys(result.data as Array<{ id: string; name: string | null; key?: string; createdAt?: string }>);
			}
		} catch {
			// API keys may not be available
		}
	};

	const onProfileSubmit = async (data: ProfileForm) => {
		setProfileError("");
		setProfileSuccess("");
		setProfileLoading(true);
		try {
			const result = await authClient.updateUser({
				name: data.name,
				// biome-ignore lint/suspicious/noExplicitAny: better-auth plugin extension
			} as any);
			if (result.error) {
				setProfileError(result.error.message ?? "Failed to update profile");
			} else {
				setProfileSuccess("Profile updated successfully");
			}
		} catch {
			setProfileError("An unexpected error occurred");
		} finally {
			setProfileLoading(false);
		}
	};

	const onPasswordSubmit = async (data: PasswordForm) => {
		setPasswordError("");
		setPasswordSuccess("");
		if (data.newPassword !== data.confirmPassword) {
			setPasswordError("Passwords do not match");
			return;
		}
		setPasswordLoading(true);
		try {
			const result = await authClient.changePassword({
				currentPassword: data.currentPassword,
				newPassword: data.newPassword,
			});
			if (result.error) {
				setPasswordError(result.error.message ?? "Failed to change password");
			} else {
				setPasswordSuccess("Password changed successfully");
				resetPassword();
			}
		} catch {
			setPasswordError("An unexpected error occurred");
		} finally {
			setPasswordLoading(false);
		}
	};

	const handleLinkSocial = async (provider: "google" | "github") => {
		setLinkError("");
		setLinkLoading(provider);
		try {
			await authClient.linkSocial({
				provider,
				callbackURL: "/account",
			});
		} catch {
			setLinkError(`Failed to link ${provider}`);
		} finally {
			setLinkLoading("");
		}
	};

	const handleUnlinkAccount = async (providerId: string) => {
		setLinkError("");
		setLinkLoading(providerId);
		try {
			await authClient.unlinkAccount({
				providerId,
			});
		} catch {
			setLinkError("Failed to unlink account");
		} finally {
			setLinkLoading("");
		}
	};

	const handleAddPasskey = async () => {
		setPasskeyError("");
		setPasskeyLoading(true);
		try {
			const result = await authClient.passkey.addPasskey();
			if (result?.error) {
				setPasskeyError(result.error.message ?? "Failed to register passkey");
			} else {
				await loadPasskeys();
			}
		} catch {
			setPasskeyError("Failed to register passkey");
		} finally {
			setPasskeyLoading(false);
		}
	};

	const handleDeletePasskey = async (passkeyId: string) => {
		setPasskeyError("");
		try {
			await authClient.passkey.deletePasskey({ id: passkeyId });
			await loadPasskeys();
		} catch {
			setPasskeyError("Failed to delete passkey");
		}
	};

	const onApiKeySubmit = async (data: ApiKeyForm) => {
		setApiKeyError("");
		setApiKeyLoading(true);
		setNewKeyValue("");
		try {
			const result = await authClient.apiKey.createKey({
				name: data.name,
			});
			if (result.error) {
				setApiKeyError(result.error.message ?? "Failed to create API key");
			} else if (result.data) {
				setNewKeyValue((result.data as Record<string, unknown>).key as string ?? "");
				resetApiKey();
				await loadApiKeys();
			}
		} catch {
			setApiKeyError("An unexpected error occurred");
		} finally {
			setApiKeyLoading(false);
		}
	};

	const handleRevokeApiKey = async (keyId: string) => {
		setApiKeyError("");
		try {
			await authClient.apiKey.deleteKey({ keyId });
			await loadApiKeys();
		} catch {
			setApiKeyError("Failed to revoke API key");
		}
	};

	if (isPending) {
		return (
			<FullLayout>
				<div className="page-wrap flex items-center justify-center px-4 py-20">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			</FullLayout>
		);
	}

	if (!session) {
		return null;
	}

	return (
		<FullLayout>
			<div className="page-wrap px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-[var(--sea-ink)]">Account Settings</h1>
					<p className="mt-1 text-muted-foreground">
						Manage your profile, security, and account preferences.
					</p>
					<div className="mt-4 flex gap-2">
						<Link to="/account" className="text-sm font-medium text-primary underline">
							General
						</Link>
						<Link to="/account/security" className="text-sm font-medium text-muted-foreground hover:underline">
							Security
						</Link>
						<Link to="/account/organizations" className="text-sm font-medium text-muted-foreground hover:underline">
							Organizations
						</Link>
						<Link to="/account/delete" className="text-sm font-medium text-destructive hover:underline">
							Delete Account
						</Link>
					</div>
				</div>

				<div className="space-y-6">
					{/* Profile Section */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<User className="h-5 w-5" />
								Profile
							</CardTitle>
							<CardDescription>
								Update your personal information.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="mb-6 flex items-center gap-4">
								<Avatar className="h-16 w-16">
									{session.user.image ? (
										<AvatarImage src={session.user.image} alt={session.user.name ?? ""} />
									) : (
										<AvatarFallback>
											{(session.user.name ?? "U").charAt(0).toUpperCase()}
										</AvatarFallback>
									)}
								</Avatar>
								<div>
									<p className="font-medium">{session.user.name}</p>
									<p className="text-sm text-muted-foreground">{session.user.email}</p>
								</div>
							</div>

							<form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
								{profileError && (
									<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
										{profileError}
									</div>
								)}
								{profileSuccess && (
									<div className="rounded-md bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
										{profileSuccess}
									</div>
								)}
								<div className="space-y-2">
									<Label htmlFor={`${id}-name`}>Display Name</Label>
									<Input
										id={`${id}-name`}
										{...registerProfile("name", { required: "Name is required" })}
									/>
									{profileErrors.name && (
										<p className="text-sm text-destructive">{profileErrors.name.message}</p>
									)}
								</div>
								<div className="space-y-2">
									<Label htmlFor={`${id}-username`}>Username</Label>
									<Input
										id={`${id}-username`}
										{...registerProfile("username")}
									/>
									{profileErrors.username && (
										<p className="text-sm text-destructive">{profileErrors.username.message}</p>
									)}
								</div>
								<div className="space-y-2">
									<Label>Email</Label>
									<Input value={session.user.email} disabled />
									<p className="text-xs text-muted-foreground">
										Email changes are not supported at this time.
									</p>
								</div>
								<Button type="submit" disabled={profileLoading}>
									{profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									Save Changes
								</Button>
							</form>
						</CardContent>
					</Card>

					{/* Change Password Section */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Key className="h-5 w-5" />
								Change Password
							</CardTitle>
							<CardDescription>
								Update your account password.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
								{passwordError && (
									<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
										{passwordError}
									</div>
								)}
								{passwordSuccess && (
									<div className="rounded-md bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
										{passwordSuccess}
									</div>
								)}
								<div className="space-y-2">
									<Label htmlFor={`${id}-current-password`}>Current Password</Label>
									<Input
										id={`${id}-current-password`}
										type="password"
										autoComplete="current-password"
										{...registerPassword("currentPassword", { required: "Current password is required" })}
									/>
									{passwordErrors.currentPassword && (
										<p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p>
									)}
								</div>
								<div className="space-y-2">
									<Label htmlFor={`${id}-new-password`}>New Password</Label>
									<Input
										id={`${id}-new-password`}
										type="password"
										autoComplete="new-password"
										{...registerPassword("newPassword", {
											required: "New password is required",
											minLength: { value: 8, message: "Password must be at least 8 characters" },
										})}
									/>
									{passwordErrors.newPassword && (
										<p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>
									)}
								</div>
								<div className="space-y-2">
									<Label htmlFor={`${id}-confirm-password`}>Confirm New Password</Label>
									<Input
										id={`${id}-confirm-password`}
										type="password"
										autoComplete="new-password"
										{...registerPassword("confirmPassword", { required: "Please confirm your password" })}
									/>
									{passwordErrors.confirmPassword && (
										<p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>
									)}
								</div>
								<Button type="submit" disabled={passwordLoading}>
									{passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									Change Password
								</Button>
							</form>
						</CardContent>
					</Card>

					{/* Linked Accounts Section */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Link2 className="h-5 w-5" />
								Linked Accounts
							</CardTitle>
							<CardDescription>
								Connect your social accounts for easier sign-in.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{linkError && (
								<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
									{linkError}
								</div>
							)}
							<div className="flex items-center justify-between rounded-lg border p-4">
								<div className="flex items-center gap-3">
									<svg className="h-5 w-5" viewBox="0 0 24 24">
										<title>Google</title>
										<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
										<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
										<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
										<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
									</svg>
									<span className="font-medium">Google</span>
								</div>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleLinkSocial("google")}
										disabled={linkLoading === "google"}
									>
										{linkLoading === "google" ? (
											<Loader2 className="mr-1 h-3 w-3 animate-spin" />
										) : (
											<Plus className="mr-1 h-3 w-3" />
										)}
										Link
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleUnlinkAccount("google")}
										disabled={linkLoading === "google"}
									>
										<Unlink className="mr-1 h-3 w-3" />
										Unlink
									</Button>
								</div>
							</div>
							<div className="flex items-center justify-between rounded-lg border p-4">
								<div className="flex items-center gap-3">
									<Github className="h-5 w-5" />
									<span className="font-medium">GitHub</span>
								</div>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleLinkSocial("github")}
										disabled={linkLoading === "github"}
									>
										{linkLoading === "github" ? (
											<Loader2 className="mr-1 h-3 w-3 animate-spin" />
										) : (
											<Plus className="mr-1 h-3 w-3" />
										)}
										Link
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleUnlinkAccount("github")}
										disabled={linkLoading === "github"}
									>
										<Unlink className="mr-1 h-3 w-3" />
										Unlink
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Passkey Management */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Fingerprint className="h-5 w-5" />
								Passkeys
							</CardTitle>
							<CardDescription>
								Manage passwordless authentication with passkeys.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{passkeyError && (
								<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
									{passkeyError}
								</div>
							)}
							{passkeys.length === 0 ? (
								<p className="text-sm text-muted-foreground">No passkeys registered yet.</p>
							) : (
								<div className="space-y-2">
									{passkeys.map((passkey) => (
										<div key={passkey.id} className="flex items-center justify-between rounded-lg border p-3">
											<div>
												<p className="text-sm font-medium">{passkey.name ?? "Passkey"}</p>
												{passkey.createdAt && (
													<p className="text-xs text-muted-foreground">
														Added {new Date(passkey.createdAt).toLocaleDateString()}
													</p>
												)}
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDeletePasskey(passkey.id)}
											>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										</div>
									))}
								</div>
							)}
							<Separator />
							<Button
								variant="outline"
								onClick={handleAddPasskey}
								disabled={passkeyLoading}
							>
								{passkeyLoading ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Plus className="mr-2 h-4 w-4" />
								)}
								Register New Passkey
							</Button>
						</CardContent>
					</Card>

					{/* API Key Section (Admin Only) */}
					{isAdmin && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Key className="h-5 w-5" />
									API Keys
									<Badge variant="secondary" className="ml-2">Admin</Badge>
								</CardTitle>
								<CardDescription>
									Create and manage API keys for programmatic access.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{apiKeyError && (
									<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
										{apiKeyError}
									</div>
								)}
								{newKeyValue && (
									<div className="rounded-md border border-green-500/30 bg-green-500/10 p-4">
										<p className="mb-2 text-sm font-medium text-green-700 dark:text-green-400">
											New API key created! Copy it now — it won&apos;t be shown again.
										</p>
										<code className="block break-all rounded bg-muted p-2 text-sm">
											{newKeyValue}
										</code>
									</div>
								)}

								{apiKeys.length === 0 ? (
									<p className="text-sm text-muted-foreground">No API keys created yet.</p>
								) : (
									<div className="space-y-2">
										{apiKeys.map((apiKey) => (
											<div key={apiKey.id} className="flex items-center justify-between rounded-lg border p-3">
												<div>
													<p className="text-sm font-medium">{apiKey.name ?? "Unnamed Key"}</p>
													{apiKey.createdAt && (
														<p className="text-xs text-muted-foreground">
															Created {new Date(apiKey.createdAt).toLocaleDateString()}
														</p>
													)}
												</div>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleRevokeApiKey(apiKey.id)}
												>
													<Trash2 className="h-4 w-4 text-destructive" />
												</Button>
											</div>
										))}
									</div>
								)}

								<Separator />
								<form onSubmit={handleApiKeySubmit(onApiKeySubmit)} className="flex gap-2">
									<div className="flex-1">
										<Input
											placeholder="Key name (e.g. CI/CD)"
											{...registerApiKey("name", { required: "Key name is required" })}
										/>
										{apiKeyErrors.name && (
											<p className="mt-1 text-sm text-destructive">{apiKeyErrors.name.message}</p>
										)}
									</div>
									<Button type="submit" disabled={apiKeyLoading}>
										{apiKeyLoading ? (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										) : (
											<Plus className="mr-2 h-4 w-4" />
										)}
										Create Key
									</Button>
								</form>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</FullLayout>
	);
}

export const Route = createFileRoute("/account/")({
	component: AccountPage,
});
