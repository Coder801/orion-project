"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { Radio } from "@base-ui/react/radio";
import { CircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function RadioGroup({
    className,
    ...props
}: React.ComponentProps<typeof RadioGroupPrimitive>) {
    return (
        <RadioGroupPrimitive
            data-slot="radio-group"
            className={cn("grid gap-3", className)}
            {...props}
        />
    );
}

function RadioGroupItem({
    className,
    ...props
}: React.ComponentProps<typeof Radio.Root>) {
    return (
        <Radio.Root
            data-slot="radio-group-item"
            className={cn(
                "aspect-square size-4.5 shrink-0 cursor-pointer rounded-full border border-input text-primary outline-hidden transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "data-checked:border-primary",
                "data-disabled:cursor-not-allowed data-disabled:opacity-50",
                className,
            )}
            {...props}
        >
            <Radio.Indicator
                data-slot="radio-group-indicator"
                className="relative flex items-center justify-center"
            >
                <CircleIcon className="absolute top-1/2 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 fill-primary text-primary" />
            </Radio.Indicator>
        </Radio.Root>
    );
}

export { RadioGroup, RadioGroupItem };
