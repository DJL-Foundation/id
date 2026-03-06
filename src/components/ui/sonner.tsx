import { X } from "lucide-react";
import * as React from "react";
import { cn } from "#/lib/utils";

type ToastVariant = "default" | "destructive" | "success";

interface Toast {
	id: string;
	title?: string;
	description?: string;
	variant?: ToastVariant;
	duration?: number;
}

interface ToasterContextValue {
	toasts: Toast[];
	addToast: (toast: Omit<Toast, "id">) => void;
	removeToast: (id: string) => void;
}

const ToasterContext = React.createContext<ToasterContextValue | null>(null);

export function useToast() {
	const context = React.useContext(ToasterContext);
	if (!context) {
		throw new Error("useToast must be used within a ToasterProvider");
	}
	return {
		toast: context.addToast,
		dismiss: context.removeToast,
		toasts: context.toasts,
	};
}

let toastCount = 0;

export function ToasterProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = React.useState<Toast[]>([]);

	const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
		const id = String(++toastCount);
		setToasts((prev) => [...prev, { ...toast, id }]);

		const duration = toast.duration ?? 5000;
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, duration);
	}, []);

	const removeToast = React.useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	return (
		<ToasterContext.Provider value={{ toasts, addToast, removeToast }}>
			{children}
		</ToasterContext.Provider>
	);
}

const variantStyles: Record<ToastVariant, string> = {
	default: "border-border bg-background text-foreground",
	destructive: "border-destructive bg-destructive text-destructive-foreground",
	success:
		"border-green-500/50 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100",
};

export function Toaster() {
	const { toasts, dismiss } = useToast();

	return (
		<div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
			{toasts.map((toast) => (
				<div
					key={toast.id}
					className={cn(
						"pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-bottom-5 fade-in-0",
						variantStyles[toast.variant ?? "default"],
					)}
					role="alert"
				>
					<div className="flex-1 space-y-1">
						{toast.title && (
							<p className="text-sm font-semibold">{toast.title}</p>
						)}
						{toast.description && (
							<p className="text-sm opacity-90">{toast.description}</p>
						)}
					</div>
					<button
						type="button"
						onClick={() => dismiss(toast.id)}
						className="shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
			))}
		</div>
	);
}
