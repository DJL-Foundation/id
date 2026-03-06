import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "#/lib/utils";

const labelVariants = cva(
	"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

export interface LabelProps
	extends React.LabelHTMLAttributes<HTMLLabelElement>,
		VariantProps<typeof labelVariants> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
	({ className, ...props }, ref) => {
		return (
			// biome-ignore lint/a11y/noLabelWithoutControl: Label is used as a reusable primitive; control association is done by consumers via htmlFor or nesting
			<label ref={ref} className={cn(labelVariants(), className)} {...props} />
		);
	},
);
Label.displayName = "Label";

export { Label };
