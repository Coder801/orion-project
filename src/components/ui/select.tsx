"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { popupMotion } from "@/lib/base-ui";

function Select({
    onValueChange,
    modal = false,
    ...props
}: Omit<React.ComponentProps<typeof SelectPrimitive.Root>, "onValueChange"> & {
    onValueChange?: (value: string) => void;
}) {
    return (
        <SelectPrimitive.Root
            modal={modal}
            {...props}
            onValueChange={
                onValueChange
                    ? (value) => onValueChange(value as string)
                    : undefined
            }
        />
    );
}

function SelectGroup(
    props: React.ComponentProps<typeof SelectPrimitive.Group>,
) {
    return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
    return (
        <SelectPrimitive.Value
            data-slot="select-value"
            className={cn(
                "line-clamp-1 flex items-center gap-2 data-placeholder:text-muted-foreground",
                className,
            )}
            {...props}
        />
    );
}

function SelectTrigger({
    className,
    size = "default",
    children,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
    size?: "sm" | "default";
}) {
    return (
        <SelectPrimitive.Trigger
            data-slot="select-trigger"
            data-size={size}
            className={cn(
                "flex w-fit cursor-pointer items-center justify-between gap-2 rounded-xl border border-input bg-transparent px-4 py-2 text-sm whitespace-nowrap outline-hidden transition-colors",
                "data-[size=default]:h-10 data-[size=sm]:h-8",
                "focus:border-primary/60 focus:ring-2 focus:ring-ring/20",
                "aria-expanded:border-primary/60 aria-expanded:ring-2 aria-expanded:ring-ring/20",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30 aria-invalid:focus:border-destructive aria-invalid:focus:ring-destructive/30",
                "data-placeholder:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            {...props}
        >
            {children}
            <SelectPrimitive.Icon
                render={<ChevronDownIcon className="size-4 opacity-50" />}
            />
        </SelectPrimitive.Trigger>
    );
}

function SelectContent({
    className,
    children,
    position,
    sideOffset = 6,
    align = "center",
    side,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Popup> & {
    position?: "popper" | "item-aligned";
    sideOffset?: number;
    align?: "start" | "center" | "end";
    side?: "top" | "right" | "bottom" | "left";
}) {
    // Radix `position` has no Base UI equivalent; kept for API parity.
    void position;

    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Positioner
                sideOffset={sideOffset}
                align={align}
                side={side}
                alignItemWithTrigger={false}
                className="z-50"
            >
                <SelectPrimitive.Popup
                    data-slot="select-content"
                    className={cn(
                        "relative z-50 max-h-(--available-height) w-(--anchor-width) overflow-x-hidden overflow-y-auto rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-xl",
                        popupMotion,
                        className,
                    )}
                    {...props}
                >
                    {children}
                </SelectPrimitive.Popup>
            </SelectPrimitive.Positioner>
        </SelectPrimitive.Portal>
    );
}

function SelectLabel({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.GroupLabel>) {
    return (
        <SelectPrimitive.GroupLabel
            data-slot="select-label"
            className={cn(
                "px-3 py-1.5 text-xs font-medium text-muted-foreground",
                className,
            )}
            {...props}
        />
    );
}

function SelectItem({
    className,
    children,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
    return (
        <SelectPrimitive.Item
            data-slot="select-item"
            className={cn(
                "relative flex w-full cursor-pointer items-center gap-2 rounded-lg py-2 pr-8 pl-3 text-sm outline-hidden select-none",
                "data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-muted",
                className,
            )}
            {...props}
        >
            <span className="absolute right-2.5 flex size-3.5 items-center justify-center">
                <SelectPrimitive.ItemIndicator>
                    <CheckIcon className="size-4" />
                </SelectPrimitive.ItemIndicator>
            </span>
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    );
}

function SelectSeparator({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
    return (
        <SelectPrimitive.Separator
            data-slot="select-separator"
            className={cn(
                "pointer-events-none -mx-1.5 my-1.5 h-px bg-border",
                className,
            )}
            {...props}
        />
    );
}

function SelectScrollUpButton({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
    return (
        <SelectPrimitive.ScrollUpArrow
            data-slot="select-scroll-up-button"
            className={cn(
                "flex cursor-default items-center justify-center py-1",
                className,
            )}
            {...props}
        >
            <ChevronUpIcon className="size-4" />
        </SelectPrimitive.ScrollUpArrow>
    );
}

function SelectScrollDownButton({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
    return (
        <SelectPrimitive.ScrollDownArrow
            data-slot="select-scroll-down-button"
            className={cn(
                "flex cursor-default items-center justify-center py-1",
                className,
            )}
            {...props}
        >
            <ChevronDownIcon className="size-4" />
        </SelectPrimitive.ScrollDownArrow>
    );
}

export {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
};
