import { X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "#/lib/utils";

interface SheetContextValue {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	side: "top" | "right" | "bottom" | "left";
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheetContext() {
	const context = React.useContext(SheetContext);
	if (!context) {
		throw new Error("Sheet components must be used within a Sheet");
	}
	return context;
}

function Sheet({
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
	children,
}: {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children: React.ReactNode;
}) {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);

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
		<SheetContext.Provider value={{ open, onOpenChange, side: "right" }}>
			{children}
		</SheetContext.Provider>
	);
}

function SheetTrigger({
	children,
	asChild,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
	const { onOpenChange } = useSheetContext();
	return (
		<button type="button" onClick={() => onOpenChange(true)} {...props}>
			{children}
		</button>
	);
}

function SheetClose({
	children,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
	const { onOpenChange } = useSheetContext();
	return (
		<button type="button" onClick={() => onOpenChange(false)} {...props}>
			{children}
		</button>
	);
}

const sheetVariants = {
	top: "inset-x-0 top-0 border-b",
	bottom: "inset-x-0 bottom-0 border-t",
	left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
	right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
} as const;

const SheetContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & {
		side?: "top" | "right" | "bottom" | "left";
	}
>(({ className, children, side = "right", ...props }, ref) => {
	const { open, onOpenChange } = useSheetContext();

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
					"fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out",
					sheetVariants[side],
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
SheetContent.displayName = "SheetContent";

const SheetHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col space-y-2 text-center sm:text-left",
			className,
		)}
		{...props}
	/>
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
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
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
	HTMLHeadingElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h2
		ref={ref}
		className={cn("text-lg font-semibold text-foreground", className)}
		{...props}
	/>
));
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn("text-sm text-muted-foreground", className)}
		{...props}
	/>
));
SheetDescription.displayName = "SheetDescription";

export {
	Sheet,
	SheetTrigger,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetFooter,
	SheetTitle,
	SheetDescription,
};
