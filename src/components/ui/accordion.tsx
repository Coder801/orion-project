"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function toArray(value: string | string[] | undefined) {
    if (value == null) return undefined;
    return Array.isArray(value) ? value : [value];
}

// Maps shadcn/Radix-style `type`/`collapsible` + string values onto Base UI's
// array value + `openMultiple` API so call sites stay unchanged.
function Accordion({
    type,
    collapsible,
    value,
    defaultValue,
    ...props
}: Omit<
    React.ComponentProps<typeof AccordionPrimitive.Root>,
    "value" | "defaultValue"
> & {
    type?: "single" | "multiple";
    collapsible?: boolean;
    value?: string | string[];
    defaultValue?: string | string[];
}) {
    // Base UI single mode (`multiple={false}`) is always collapsible.
    void collapsible;

    return (
        <AccordionPrimitive.Root
            data-slot="accordion"
            multiple={type ? type === "multiple" : undefined}
            value={toArray(value)}
            defaultValue={toArray(defaultValue)}
            {...props}
        />
    );
}

function AccordionItem({
    className,
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
    return (
        <AccordionPrimitive.Item
            data-slot="accordion-item"
            className={cn("border-b last:border-b-0", className)}
            {...props}
        />
    );
}

function AccordionTrigger({
    className,
    children,
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
    return (
        <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger
                data-slot="accordion-trigger"
                className={cn(
                    "flex flex-1 cursor-pointer items-start justify-between gap-4 py-5 text-left text-base font-medium outline-hidden transition-all",
                    "rounded-md hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/50",
                    "data-panel-open:[&>svg]:rotate-180",
                    className,
                )}
                {...props}
            >
                {children}
                <ChevronDownIcon className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200" />
            </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
    );
}

function AccordionContent({
    className,
    children,
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Panel>) {
    return (
        <AccordionPrimitive.Panel
            data-slot="accordion-content"
            className="overflow-hidden text-sm data-closed:animate-accordion-up data-open:animate-accordion-down"
            {...props}
        >
            <div className={cn("pt-0 pb-5 text-muted-foreground", className)}>
                {children}
            </div>
        </AccordionPrimitive.Panel>
    );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
