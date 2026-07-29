import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        /* Was `border border-input`. With no borders in the system, an
           outline button's edge has to come from a fill, so it becomes
           the sunken tone against the page, the same step that separates
           a container from its canvas. */
        outline: "bg-surface-sunken hover:bg-surface-recessed",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /**
   * Swaps the leading content for a spinner and takes the button out of the
   * tab order for the duration. The label stays put; see the note in the
   * component about why the text does not change.
   */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, children, disabled, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    /* `asChild` hands rendering to the caller's element, so there is no slot
       this component can safely inject a spinner into. The child owns its
       own children. Rather than silently dropping `loading`, the two are
       treated as mutually exclusive and the spinner is skipped; a caller that
       needs both composes <Spinner /> into its own child. */
    const showSpinner = loading && !asChild;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        /* Disabled rather than aria-disabled: a pending action has nothing to
           re-submit to, so removing it from the tab order is honest. The
           `disabled:opacity-50` in the base is what makes the pending state
           read as inert instead of merely busy. */
        disabled={disabled || showSpinner}
        aria-busy={showSpinner || undefined}
        {...props}
      >
        {showSpinner && <Spinner size="control" />}
        {/* The label does not change on load, deliberately. A button whose
            text swaps ("Send" → "Sending…") reflows its own width mid-press
            and moves the thing the pointer is still over; the spinner is the
            state change, and it is additive. Callers who genuinely want the
            morphing label pass one through <AnimatedText>, which tweens the
            width instead of jumping it. */}
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
