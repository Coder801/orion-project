"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { cn } from "@/lib/utils";
import { asChildProps, popupMotion } from "@/lib/base-ui";

function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
    return <PopoverPrimitive.Root {...props} />;
}

function PopoverTrigger({
    asChild,
    children,
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger> & {
    asChild?: boolean;
}) {
    return (
        <PopoverPrimitive.Trigger
            data-slot="popover-trigger"
            {...props}
            {...asChildProps(asChild, children)}
        />
    );
}

function PopoverContent({
    className,
    align = "center",
    sideOffset = 6,
    side,
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Popup> & {
    align?: "start" | "center" | "end";
    sideOffset?: number;
    side?: "top" | "right" | "bottom" | "left";
}) {
    return (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Positioner
                align={align}
                sideOffset={sideOffset}
                side={side}
                className="z-50"
            >
                <PopoverPrimitive.Popup
                    data-slot="popover-content"
                    className={cn(
                        "z-50 w-72 rounded-xl border bg-popover p-4 text-popover-foreground shadow-xl outline-hidden",
                        popupMotion,
                        className,
                    )}
                    {...props}
                />
            </PopoverPrimitive.Positioner>
        </PopoverPrimitive.Portal>
    );
}

export { Popover, PopoverTrigger, PopoverContent };
