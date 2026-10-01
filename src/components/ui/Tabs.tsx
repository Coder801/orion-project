"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@/lib/utils";

function Tabs({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
    return (
        <TabsPrimitive.Root
            data-slot="tabs"
            className={cn("flex flex-col gap-2", className)}
            {...props}
        />
    );
}

function TabsList({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
    return (
        <TabsPrimitive.List
            data-slot="tabs-list"
            className={cn(
                "inline-flex h-11 w-fit items-center justify-center rounded-full border border-border bg-muted/60 p-1 text-muted-foreground",
                className,
            )}
            {...props}
        />
    );
}

function TabsTrigger({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Tab>) {
    return (
        <TabsPrimitive.Tab
            data-slot="tabs-trigger"
            className={cn(
                "inline-flex h-full flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-1 text-sm font-medium whitespace-nowrap outline-hidden transition-all",
                "text-muted-foreground hover:text-foreground",
                "focus-visible:ring-2 focus-visible:ring-ring/50",
                "data-active:bg-card data-active:text-foreground data-active:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.2)] dark:data-active:shadow-[0_0_20px_-6px_var(--glow-primary)]",
                "disabled:pointer-events-none disabled:opacity-50",
                "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            {...props}
        />
    );
}

function TabsContent({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Panel>) {
    return (
        <TabsPrimitive.Panel
            data-slot="tabs-content"
            className={cn("flex-1 outline-hidden", className)}
            {...props}
        />
    );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
