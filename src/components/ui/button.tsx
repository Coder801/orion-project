import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-medium whitespace-nowrap outline-hidden transition-all duration-300 select-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_8px_24px_-8px_var(--glow-primary)] hover:-translate-y-px hover:bg-primary/90 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)_inset,0_12px_32px_-8px_var(--glow-primary)] active:translate-y-0",
                gradient:
                    "bg-[linear-gradient(110deg,var(--color-primary),var(--color-secondary)_50%,var(--color-primary))] bg-[length:200%_100%] text-white shadow-[0_8px_32px_-8px_var(--glow-primary)] hover:-translate-y-px hover:bg-[position:100%_0] hover:shadow-[0_12px_40px_-8px_var(--glow-primary)] active:translate-y-0",
                secondary:
                    "border border-border bg-muted text-foreground hover:bg-muted/70",
                outline:
                    "border border-border bg-transparent text-foreground hover:border-primary/40 hover:bg-muted/60",
                ghost: "text-foreground hover:bg-muted/60",
                glass: "text-foreground glass hover:border-primary/30 hover:bg-[color-mix(in_srgb,var(--card)_80%,transparent)]",
                link: "text-primary underline-offset-4 hover:underline",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            },
            size: {
                default: "h-10 px-5",
                sm: "h-8 px-4 text-xs",
                lg: "h-12 px-7 text-base",
                xl: "h-14 px-9 text-base",
                icon: "size-10",
                "icon-sm": "size-8",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

type ButtonProps = React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        /** Render as the passed child element instead of a `<button>`. */
        asChild?: boolean;
        /** Base UI render prop; overrides the default element. */
        render?: useRender.RenderProp;
    };

function Button({
    className,
    variant,
    size,
    asChild = false,
    render,
    children,
    ...props
}: ButtonProps) {
    return useRender({
        defaultTagName: "button",
        render:
            asChild && React.isValidElement(children)
                ? (children as React.ReactElement<Record<string, unknown>>)
                : render,
        props: {
            "data-slot": "button",
            className: cn(buttonVariants({ variant, size, className })),
            ...(asChild ? {} : { children }),
            ...props,
        },
    });
}

export { Button, buttonVariants };
