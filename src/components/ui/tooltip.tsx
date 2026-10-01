"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";
import { asChildProps, popupMotion } from "@/lib/base-ui";

function TooltipProvider({
    delay = 0,
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
    return <TooltipPrimitive.Provider delay={delay} {...props} />;
}

function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
    return (
        <TooltipProvider>
            <TooltipPrimitive.Root {...props} />
        </TooltipProvider>
    );
}

function TooltipTrigger({
    asChild,
    children,
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger> & {
    asChild?: boolean;
}) {
    return (
        <TooltipPrimitive.Trigger
            {...props}
            {...asChildProps(asChild, children)}
        />
    );
}

function TooltipContent({
    className,
    sideOffset = 6,
    side,
    align,
    children,
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Popup> & {
    sideOffset?: number;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
}) {
    return (
        <TooltipPrimitive.Portal>
            <TooltipPrimitive.Positioner
                className="z-50"
                sideOffset={sideOffset}
                side={side}
                align={align}
            >
                <TooltipPrimitive.Popup
                    className={cn(
                        "z-50 w-fit rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-md",
                        popupMotion,
                        className,
                    )}
                    {...props}
                >
                    {children}
                </TooltipPrimitive.Popup>
            </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
    );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
