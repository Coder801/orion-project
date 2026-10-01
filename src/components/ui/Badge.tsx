import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors [&>svg]:pointer-events-none [&>svg]:size-3",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground",
                secondary: "border-transparent bg-muted text-muted-foreground",
                outline: "border-border text-foreground",
                glow: "border-primary/30 bg-primary/10 text-(--primary-bright) shadow-[0_0_20px_-4px_var(--glow-primary)]",
                accent: "border-accent/30 bg-accent/10 text-accent-foreground dark:text-accent",
                pink: "border-pink/30 bg-pink/10 text-pink",
                success: "border-success/30 bg-success/10 text-success",
                warning: "border-warning/30 bg-warning/10 text-warning",
                destructive:
                    "border-destructive/30 bg-destructive/10 text-destructive",
                glass: "text-foreground glass",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

type BadgeProps = React.ComponentProps<"span"> &
    VariantProps<typeof badgeVariants> & {
        /** Render as the passed child element instead of a `<span>`. */
        asChild?: boolean;
        /** Base UI render prop; overrides the default element. */
        render?: useRender.RenderProp;
    };

function Badge({
    className,
    variant,
    asChild = false,
    render,
    children,
    ...props
}: BadgeProps) {
    return useRender({
        defaultTagName: "span",
        render:
            asChild && React.isValidElement(children)
                ? (children as React.ReactElement<Record<string, unknown>>)
                : render,
        props: {
            "data-slot": "badge",
            className: cn(badgeVariants({ variant }), className),
            ...(asChild ? {} : { children }),
            ...props,
        },
    });
}

export { Badge, badgeVariants };
