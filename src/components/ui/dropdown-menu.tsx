import * as React from "react";
import { cn } from "#/lib/utils";

interface DropdownMenuContextValue {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const DropdownMenuContext =
	React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext() {
	const context = React.useContext(DropdownMenuContext);
	if (!context) {
		throw new Error(
			"DropdownMenu components must be used within a DropdownMenu",
		);
	}
	return context;
}

function DropdownMenu({
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
		<DropdownMenuContext.Provider value={{ open, onOpenChange }}>
			<div className="relative inline-block text-left">{children}</div>
		</DropdownMenuContext.Provider>
	);
}

function DropdownMenuTrigger({
	className,
	children,
	asChild,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
	const { open, onOpenChange } = useDropdownMenuContext();
	return (
		<button
			type="button"
			className={className}
			onClick={() => onOpenChange(!open)}
			aria-expanded={open}
			aria-haspopup="true"
			{...props}
		>
			{children}
		</button>
	);
}

function DropdownMenuContent({
	className,
	align = "start",
	sideOffset: _sideOffset = 4,
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement> & {
	align?: "start" | "center" | "end";
	sideOffset?: number;
}) {
	const { open, onOpenChange } = useDropdownMenuContext();
	const ref = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (!open) return;

		function handleClickOutside(event: MouseEvent) {
			if (
				ref.current &&
				!ref.current.closest(".relative")?.contains(event.target as Node)
			) {
				onOpenChange(false);
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				onOpenChange(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [open, onOpenChange]);

	if (!open) return null;

	return (
		<div
			ref={ref}
			role="menu"
			className={cn(
				"absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
				align === "end" && "right-0",
				align === "center" && "left-1/2 -translate-x-1/2",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

function DropdownMenuItem({
	className,
	inset,
	disabled,
	children,
	onClick,
	...props
}: React.HTMLAttributes<HTMLDivElement> & {
	inset?: boolean;
	disabled?: boolean;
}) {
	const { onOpenChange } = useDropdownMenuContext();

	return (
		<div
			role="menuitem"
			tabIndex={disabled ? -1 : 0}
			className={cn(
				"relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
				inset && "pl-8",
				disabled && "pointer-events-none opacity-50",
				className,
			)}
			onClick={(e) => {
				if (disabled) return;
				onClick?.(e);
				onOpenChange(false);
			}}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					if (!disabled) {
						(e.target as HTMLElement).click();
					}
				}
			}}
			{...props}
		>
			{children}
		</div>
	);
}

function DropdownMenuSeparator({
	className,
	...props
}: React.HTMLAttributes<HTMLHRElement>) {
	return (
		<hr
			className={cn("-mx-1 my-1 h-px border-0 bg-muted", className)}
			{...props}
		/>
	);
}

function DropdownMenuLabel({
	className,
	inset,
	...props
}: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }) {
	return (
		<div
			className={cn(
				"px-2 py-1.5 text-sm font-semibold",
				inset && "pl-8",
				className,
			)}
			{...props}
		/>
	);
}

function DropdownMenuGroup({
	children,
	...props
}: React.HTMLAttributes<HTMLFieldSetElement>) {
	return (
		<fieldset className="border-0 p-0 m-0" {...props}>
			{children}
		</fieldset>
	);
}

export {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuLabel,
	DropdownMenuGroup,
};
