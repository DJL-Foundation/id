import { Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export default function AuthLayout({
	children,
	showBackButton = false,
}: {
	children: React.ReactNode;
	showBackButton?: boolean;
}) {
	const router = useRouter();

	return (
		<div className="flex min-h-screen flex-col bg-[var(--bg-base)]">
			<div className="px-4 pt-4">
				{showBackButton ? (
					<button
						type="button"
						onClick={() => router.history.back()}
						className="inline-flex items-center gap-1 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-medium text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:shadow-md"
					>
						<ChevronLeft size={16} />
						Back
					</button>
				) : (
					<Link
						to="/"
						className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)]"
					>
						<span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
						DJL Foundation ID
					</Link>
				)}
			</div>

			<main className="flex flex-1 items-center justify-center px-4 py-12">
				{children}
			</main>
		</div>
	);
}
