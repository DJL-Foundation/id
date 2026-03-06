import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	AlertTriangle,
	Fingerprint,
	Loader2,
	Monitor,
	Plus,
	QrCode,
	Shield,
	Smartphone,
	Trash2,
	X,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import FullLayout from "#/components/layouts/FullLayout";
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

interface PasswordConfirmForm {
	password: string;
}

function SecurityPage() {
	const id = useId();
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	const [totpEnabled, setTotpEnabled] = useState(false);
	const [totpUri, setTotpUri] = useState("");
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [totpLoading, setTotpLoading] = useState(false);
	const [totpError, setTotpError] = useState("");
	const [showDisableConfirm, setShowDisableConfirm] = useState(false);

	const [sessions, setSessions] = useState<Array<{
		id: string;
		token: string;
		userAgent?: string;
		ipAddress?: string;
		updatedAt?: string;
	}>>([]);
	const [sessionsLoading, setSessionsLoading] = useState(false);
	const [sessionsError, setSessionsError] = useState("");

	const [passkeys, setPasskeys] = useState<Array<{ id: string; name?: string; createdAt?: string }>>([]);
	const [passkeyLoading, setPasskeyLoading] = useState(false);
	const [passkeyError, setPasskeyError] = useState("");

	const {
		register: registerDisable,
		handleSubmit: handleDisableSubmit,
		formState: { errors: disableErrors },
		reset: resetDisable,
	} = useForm<PasswordConfirmForm>();

	useEffect(() => {
		if (!isPending && !session) {
			void navigate({ to: "/auth/sign-in" });
		}
	}, [isPending, session, navigate]);

	useEffect(() => {
		if (session) {
			void loadSessions();
			void loadPasskeys();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session]);

	const loadSessions = async () => {
		setSessionsLoading(true);
		try {
			const result = await authClient.listSessions();
			if (result.data) {
				setSessions(result.data as Array<{
					id: string;
					token: string;
					userAgent?: string;
					ipAddress?: string;
					updatedAt?: string;
				}>);
			}
		} catch {
			setSessionsError("Failed to load sessions");
		} finally {
			setSessionsLoading(false);
		}
	};

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

	const handleEnableTotp = async () => {
		setTotpError("");
		setTotpLoading(true);
		try {
			const result = await authClient.twoFactor.enable({
				password: "",
			});
			if (result.error) {
				setTotpError(result.error.message ?? "Failed to enable 2FA");
			} else if (result.data) {
				const data = result.data as Record<string, unknown>;
				setTotpUri(data.totpURI as string ?? "");
				setBackupCodes(data.backupCodes as string[] ?? []);
				setTotpEnabled(true);
			}
		} catch {
			setTotpError("An unexpected error occurred");
		} finally {
			setTotpLoading(false);
		}
	};

	const onDisableTotp = async (data: PasswordConfirmForm) => {
		setTotpError("");
		setTotpLoading(true);
		try {
			const result = await authClient.twoFactor.disable({
				password: data.password,
			});
			if (result.error) {
				setTotpError(result.error.message ?? "Failed to disable 2FA");
			} else {
				setTotpEnabled(false);
				setTotpUri("");
				setBackupCodes([]);
				setShowDisableConfirm(false);
				resetDisable();
			}
		} catch {
			setTotpError("An unexpected error occurred");
		} finally {
			setTotpLoading(false);
		}
	};

	const handleRevokeSession = async (sessionToken: string) => {
		setSessionsError("");
		try {
			await authClient.revokeSession({ token: sessionToken });
			await loadSessions();
		} catch {
			setSessionsError("Failed to revoke session");
		}
	};

	const handleRevokeAllSessions = async () => {
		setSessionsError("");
		try {
			await authClient.revokeSessions();
			await loadSessions();
		} catch {
			setSessionsError("Failed to revoke sessions");
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

	const getDeviceIcon = (userAgent?: string) => {
		if (!userAgent) return <Monitor className="h-5 w-5" />;
		if (/mobile|android|iphone/i.test(userAgent)) {
			return <Smartphone className="h-5 w-5" />;
		}
		return <Monitor className="h-5 w-5" />;
	};

	const getDeviceName = (userAgent?: string) => {
		if (!userAgent) return "Unknown Device";
		if (/chrome/i.test(userAgent)) return "Chrome";
		if (/firefox/i.test(userAgent)) return "Firefox";
		if (/safari/i.test(userAgent)) return "Safari";
		if (/edge/i.test(userAgent)) return "Edge";
		return "Unknown Browser";
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
					<h1 className="text-3xl font-bold text-[var(--sea-ink)]">Security Settings</h1>
					<p className="mt-1 text-muted-foreground">
						Manage two-factor authentication, sessions, and passkeys.
					</p>
					<div className="mt-4 flex gap-2">
						<Link to="/account" className="text-sm font-medium text-muted-foreground hover:underline">
							General
						</Link>
						<Link to="/account/security" className="text-sm font-medium text-primary underline">
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
					{/* Two-Factor Authentication */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Shield className="h-5 w-5" />
								Two-Factor Authentication
							</CardTitle>
							<CardDescription>
								Add an extra layer of security to your account with TOTP.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{totpError && (
								<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
									{totpError}
								</div>
							)}

							{totpEnabled && totpUri ? (
								<div className="space-y-4">
									<div className="rounded-md border border-green-500/30 bg-green-500/10 p-4">
										<p className="mb-2 font-medium text-green-700 dark:text-green-400">
											2FA has been enabled!
										</p>
										<p className="mb-3 text-sm text-muted-foreground">
											Scan this QR code with your authenticator app, or copy the URI below.
										</p>
										<div className="flex items-center justify-center rounded-lg bg-white p-4">
											<QrCode className="h-32 w-32 text-gray-800" />
										</div>
										<div className="mt-3">
											<Label>TOTP URI</Label>
											<code className="mt-1 block break-all rounded bg-muted p-2 text-xs">
												{totpUri}
											</code>
										</div>
									</div>

									{backupCodes.length > 0 && (
										<div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-4">
											<div className="mb-2 flex items-center gap-2">
												<AlertTriangle className="h-4 w-4 text-amber-600" />
												<p className="font-medium text-amber-700 dark:text-amber-400">
													Backup Codes
												</p>
											</div>
											<p className="mb-3 text-sm text-muted-foreground">
												Save these backup codes in a secure location. Each code can only be used once.
											</p>
											<div className="grid grid-cols-2 gap-2">
												{backupCodes.map((code) => (
													<code key={code} className="rounded bg-muted p-2 text-center text-sm font-mono">
														{code}
													</code>
												))}
											</div>
										</div>
									)}
								</div>
							) : totpEnabled ? (
								<div className="space-y-4">
									<div className="flex items-center gap-2">
										<Badge variant="default" className="bg-green-600">Enabled</Badge>
										<span className="text-sm text-muted-foreground">
											Two-factor authentication is active on your account.
										</span>
									</div>
									{showDisableConfirm ? (
										<form onSubmit={handleDisableSubmit(onDisableTotp)} className="space-y-3">
											<div className="space-y-2">
												<Label htmlFor={`${id}-disable-password`}>
													Enter your password to disable 2FA
												</Label>
												<Input
													id={`${id}-disable-password`}
													type="password"
													{...registerDisable("password", { required: "Password is required" })}
												/>
												{disableErrors.password && (
													<p className="text-sm text-destructive">{disableErrors.password.message}</p>
												)}
											</div>
											<div className="flex gap-2">
												<Button type="submit" variant="destructive" disabled={totpLoading}>
													{totpLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
													Confirm Disable
												</Button>
												<Button
													type="button"
													variant="outline"
													onClick={() => {
														setShowDisableConfirm(false);
														resetDisable();
													}}
												>
													Cancel
												</Button>
											</div>
										</form>
									) : (
										<Button variant="destructive" onClick={() => setShowDisableConfirm(true)}>
											Disable 2FA
										</Button>
									)}
								</div>
							) : (
								<div>
									<p className="mb-4 text-sm text-muted-foreground">
										Two-factor authentication is not enabled. We recommend enabling it for additional security.
									</p>
									<Button onClick={handleEnableTotp} disabled={totpLoading}>
										{totpLoading ? (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										) : (
											<Shield className="mr-2 h-4 w-4" />
										)}
										Enable 2FA
									</Button>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Active Sessions */}
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="flex items-center gap-2">
										<Monitor className="h-5 w-5" />
										Active Sessions
									</CardTitle>
									<CardDescription>
										Devices and browsers currently signed into your account.
									</CardDescription>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={handleRevokeAllSessions}
								>
									<X className="mr-1 h-3 w-3" />
									Revoke All Others
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-3">
							{sessionsError && (
								<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
									{sessionsError}
								</div>
							)}
							{sessionsLoading ? (
								<div className="flex justify-center py-4">
									<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
								</div>
							) : sessions.length === 0 ? (
								<p className="text-sm text-muted-foreground">No active sessions found.</p>
							) : (
								sessions.map((s) => {
									const isCurrent = s.token === session.session?.token;
									return (
										<div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
											<div className="flex items-center gap-3">
												{getDeviceIcon(s.userAgent)}
												<div>
													<div className="flex items-center gap-2">
														<p className="text-sm font-medium">{getDeviceName(s.userAgent)}</p>
														{isCurrent && <Badge variant="secondary">Current</Badge>}
													</div>
													<p className="text-xs text-muted-foreground">
														{s.ipAddress ?? "Unknown IP"}
														{s.updatedAt && ` · Last active ${new Date(s.updatedAt).toLocaleDateString()}`}
													</p>
												</div>
											</div>
											{!isCurrent && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleRevokeSession(s.token)}
												>
													Revoke
												</Button>
											)}
										</div>
									);
								})
							)}
						</CardContent>
					</Card>

					{/* Passkeys */}
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
				</div>
			</div>
		</FullLayout>
	);
}

export const Route = createFileRoute("/account/security")({
	component: SecurityPage,
});
