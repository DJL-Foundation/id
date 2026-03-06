import { X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "#/lib/utils";

interface DialogContextValue {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext() {
	const context = React.useContext(DialogContext);
	if (!context) {
		throw new Error("Dialog components must be used within a Dialog");
	}
	return context;
}

function Dialog({
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
	defaultOpen = false,
	children,
}: {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	defaultOpen?: boolean;
	children: React.ReactNode;
}) {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);

	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : uncontrolledOpen;
	const onOpenChange = React.useCallback(
		(value: boolean) => {
			if (!isControlled) {
				setUncontrolledOpen(value);
			}
			controlledOnOpenChange?.(value);
		},
		[isControlled, controlledOnOpenChange],
	);

	return (
		<DialogContext.Provider value={{ open, onOpenChange }}>
			{children}
		</DialogContext.Provider>
	);
}

function DialogTrigger({
	children,
	asChild,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
	const { onOpenChange } = useDialogContext();
	return (
		<button type="button" onClick={() => onOpenChange(true)} {...props}>
			{children}
		</button>
	);
}

function DialogPortal({ children }: { children: React.ReactNode }) {
	const { open } = useDialogContext();
	if (!open) return null;

	return createPortal(children, document.body);
}

const DialogOverlay = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
			className,
		)}
		{...props}
	/>
));
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
	const { open, onOpenChange } = useDialogContext();

	React.useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				onOpenChange(false);
			}
		}
		if (open) {
			document.addEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "hidden";
		}
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "";
		};
	}, [open, onOpenChange]);

	if (!open) return null;

	return createPortal(
		<>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: overlay dismiss is supplementary to Escape key handler */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: overlay backdrop is not an interactive element */}
			<div
				className="fixed inset-0 z-50 bg-black/80"
				onClick={() => onOpenChange(false)}
			/>
			<div
				ref={ref}
				role="dialog"
				aria-modal="true"
				className={cn(
					"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
					className,
				)}
				{...props}
			>
				{children}
				<button
					type="button"
					className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
					onClick={() => onOpenChange(false)}
				>
					<X className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</button>
			</div>
		</>,
		document.body,
	);
});
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col space-y-1.5 text-center sm:text-left",
			className,
		)}
		{...props}
	/>
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
			className,
		)}
		{...props}
	/>
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
	HTMLHeadingElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h2
		ref={ref}
		className={cn(
			"text-lg font-semibold leading-none tracking-tight",
			className,
		)}
		{...props}
	/>
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn("text-sm text-muted-foreground", className)}
		{...props}
	/>
));
DialogDescription.displayName = "DialogDescription";

export {
	Dialog,
	DialogPortal,
	DialogOverlay,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
};
