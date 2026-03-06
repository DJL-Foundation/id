import { Link } from "@tanstack/react-router";
import {
	Building2,
	Home,
	LogOut,
	Shield,
	User,
	UserCircle,
} from "lucide-react";
import ParaglideLocaleSwitcher from "#/components/LocaleSwitcher";
import ThemeToggle from "#/components/ThemeToggle";
import { authClient } from "#/lib/auth-client";

export default function FullLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session, isPending } = authClient.useSession();
	const isAdmin = session?.user?.role === "admin";

	return (
		<div className="flex min-h-screen flex-col">
			<header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
				<nav className="page-wrap flex items-center gap-4 py-3">
					<Link
						to="/"
						className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)]"
					>
						<span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
						DJL Foundation ID
					</Link>

					<div className="hidden items-center gap-1 text-sm font-semibold sm:flex">
						<Link
							to="/"
							className="nav-link inline-flex items-center gap-1.5 px-3 py-1.5"
							activeProps={{ className: "nav-link is-active" }}
							activeOptions={{ exact: true }}
						>
							<Home size={15} />
							Home
						</Link>
						<Link
							to="/account"
							className="nav-link inline-flex items-center gap-1.5 px-3 py-1.5"
							activeProps={{ className: "nav-link is-active" }}
						>
							<UserCircle size={15} />
							Account
						</Link>
						<Link
							to="/org"
							className="nav-link inline-flex items-center gap-1.5 px-3 py-1.5"
							activeProps={{ className: "nav-link is-active" }}
						>
							<Building2 size={15} />
							Organizations
						</Link>
						{isAdmin && (
							<Link
								to="/admin"
								className="nav-link inline-flex items-center gap-1.5 px-3 py-1.5"
								activeProps={{ className: "nav-link is-active" }}
							>
								<Shield size={15} />
								Admin
							</Link>
						)}
					</div>

					<div className="ml-auto flex items-center gap-2">
						<ParaglideLocaleSwitcher />
						<ThemeToggle />

						{isPending ? (
							<div className="h-8 w-8 animate-pulse rounded-full bg-[var(--surface)]" />
						) : session?.user ? (
							<div className="flex items-center gap-2">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--chip-bg)] border border-[var(--chip-line)] text-xs font-semibold text-[var(--sea-ink)]">
									{session.user.image ? (
										<img
											src={session.user.image}
											alt=""
											className="h-8 w-8 rounded-full"
										/>
									) : (
										<User size={16} />
									)}
								</div>
								<span className="hidden text-sm font-medium text-[var(--sea-ink)] sm:inline">
									{session.user.name}
								</span>
								<button
									type="button"
									onClick={() => {
										void authClient.signOut();
									}}
									className="inline-flex items-center gap-1 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-medium text-[var(--sea-ink)] transition hover:-translate-y-0.5 hover:shadow-md"
								>
									<LogOut size={14} />
									<span className="hidden sm:inline">Sign out</span>
								</button>
							</div>
						) : (
							<Link
								to="/auth/sign-in"
								className="inline-flex items-center gap-1.5 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-1.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:shadow-md"
							>
								Sign in
							</Link>
						)}
					</div>
				</nav>
			</header>

			<main className="flex-1">{children}</main>

			<footer className="mt-auto border-t border-[var(--line)] px-4 py-6 text-[var(--sea-ink-soft)]">
				<div className="page-wrap flex flex-col items-center justify-between gap-4 sm:flex-row">
					<p className="m-0 text-sm">
						&copy; {new Date().getFullYear()} DJL Foundation
					</p>
					<div className="flex items-center gap-3">
						<ParaglideLocaleSwitcher />
						<ThemeToggle />
					</div>
				</div>
			</footer>
		</div>
	);
}
