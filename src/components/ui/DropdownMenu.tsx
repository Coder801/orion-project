"use client";

import * as React from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { asChildProps, popupMotion } from "@/lib/base-ui";

const popupClasses = cn(
    "z-50 overflow-hidden rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-xl",
    popupMotion,
);

const itemClasses = cn(
    "relative flex cursor-pointer items-center gap-2 rounded-lg py-2 text-sm outline-hidden transition-colors select-none",
    "data-highlighted:bg-muted data-highlighted:text-foreground",
    "data-disabled:pointer-events-none data-disabled:opacity-50",
);

function DropdownMenu(props: React.ComponentProps<typeof MenuPrimitive.Root>) {
    return <MenuPrimitive.Root {...props} />;
}

function DropdownMenuTrigger({
    asChild,
    children,
    ...props
}: React.ComponentProps<typeof MenuPrimitive.Trigger> & {
    asChild?: boolean;
}) {
    return (
        <MenuPrimitive.Trigger
            {...props}
            {...asChildProps(asChild, children)}
        />
    );
}

function DropdownMenuContent({
    className,
    sideOffset = 6,
    align = "center",
    side,
    ...props
}: React.ComponentProps<typeof MenuPrimitive.Popup> & {
    sideOffset?: number;
    align?: "start" | "center" | "end";
    side?: "top" | "right" | "bottom" | "left";
}) {
    return (
        <MenuPrimitive.Portal>
            <MenuPrimitive.Positioner
                className="z-50"
                sideOffset={sideOffset}
                align={align}
                side={side}
            >
                <MenuPrimitive.Popup
                    className={cn(popupClasses, "min-w-40", className)}
                    {...props}
                />
            </MenuPrimitive.Positioner>
        </MenuPrimitive.Portal>
    );
}

function DropdownMenuGroup(
    props: React.ComponentProps<typeof MenuPrimitive.Group>,
) {
    return <MenuPrimitive.Group {...props} />;
}

function DropdownMenuItem({
    className,
    inset,
    variant = "default",
    asChild,
    children,
    ...props
}: React.ComponentProps<typeof MenuPrimitive.Item> & {
    inset?: boolean;
    variant?: "default" | "destructive";
    asChild?: boolean;
}) {
    return (
        <MenuPrimitive.Item
            data-variant={variant}
            data-inset={inset ? "" : undefined}
            className={cn(
                itemClasses,
                "px-3",
                "data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/10",
                "data-inset:pl-8",
                "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-muted-foreground [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            {...props}
            {...asChildProps(asChild, children)}
        />
    );
}

function DropdownMenuCheckboxItem({
    className,
    children,
    ...props
}: React.ComponentProps<typeof MenuPrimitive.CheckboxItem>) {
    return (
        <MenuPrimitive.CheckboxItem
            className={cn(itemClasses, "py-2 pr-3 pl-8", className)}
            {...props}
        >
            <span className="pointer-events-none absolute left-2.5 flex size-3.5 items-center justify-center">
                <MenuPrimitive.CheckboxItemIndicator>
                    <CheckIcon className="size-4" />
                </MenuPrimitive.CheckboxItemIndicator>
            </span>
            {children}
        </MenuPrimitive.CheckboxItem>
    );
}

function DropdownMenuRadioGroup(
    props: React.ComponentProps<typeof MenuPrimitive.RadioGroup>,
) {
    return <MenuPrimitive.RadioGroup {...props} />;
}

function DropdownMenuRadioItem({
    className,
    children,
    ...props
}: React.ComponentProps<typeof MenuPrimitive.RadioItem>) {
    return (
        <MenuPrimitive.RadioItem
            className={cn(itemClasses, "py-2 pr-3 pl-8", className)}
            {...props}
        >
            <span className="pointer-events-none absolute left-2.5 flex size-3.5 items-center justify-center">
                <MenuPrimitive.RadioItemIndicator>
                    <CircleIcon className="size-2 fill-current" />
                </MenuPrimitive.RadioItemIndicator>
            </span>
            {children}
        </MenuPrimitive.RadioItem>
    );
}

// Base UI has no standalone menu label — Menu.GroupLabel throws unless nested in
// a Menu.Group, so render a plain styled div (these labels are section headers).
function DropdownMenuLabel({
    className,
    inset,
    ...props
}: React.ComponentProps<"div"> & {
    inset?: boolean;
}) {
    return (
        <div
            data-inset={inset ? "" : undefined}
            className={cn(
                "px-3 py-1.5 text-xs font-medium text-muted-foreground data-inset:pl-8",
                className,
            )}
            {...props}
        />
    );
}

function DropdownMenuSeparator({
    className,
    ...props
}: React.ComponentProps<typeof SeparatorPrimitive>) {
    return (
        <SeparatorPrimitive
            className={cn("-mx-1.5 my-1.5 h-px bg-border", className)}
            {...props}
        />
    );
}

function DropdownMenuShortcut({
    className,
    ...props
}: React.ComponentProps<"span">) {
    return (
        <span
            className={cn(
                "ml-auto font-mono text-xs tracking-widest text-muted-foreground",
                className,
            )}
            {...props}
        />
    );
}

function DropdownMenuSub(
    props: React.ComponentProps<typeof MenuPrimitive.SubmenuRoot>,
) {
    return <MenuPrimitive.SubmenuRoot {...props} />;
}

function DropdownMenuSubTrigger({
    className,
    inset,
    children,
    ...props
}: React.ComponentProps<typeof MenuPrimitive.SubmenuTrigger> & {
    inset?: boolean;
}) {
    return (
        <MenuPrimitive.SubmenuTrigger
            data-inset={inset ? "" : undefined}
            className={cn(
                itemClasses,
                "px-3 data-inset:pl-8 data-popup-open:bg-muted",
                className,
            )}
            {...props}
        >
            {children}
            <ChevronRightIcon className="ml-auto size-4" />
        </MenuPrimitive.SubmenuTrigger>
    );
}

function DropdownMenuSubContent({
    className,
    sideOffset = 4,
    ...props
}: React.ComponentProps<typeof MenuPrimitive.Popup> & {
    sideOffset?: number;
}) {
    return (
        <MenuPrimitive.Portal>
            <MenuPrimitive.Positioner className="z-50" sideOffset={sideOffset}>
                <MenuPrimitive.Popup
                    className={cn(popupClasses, "min-w-32", className)}
                    {...props}
                />
            </MenuPrimitive.Positioner>
        </MenuPrimitive.Portal>
    );
}

function DropdownMenuPortal(
    props: React.ComponentProps<typeof MenuPrimitive.Portal>,
) {
    return <MenuPrimitive.Portal {...props} />;
}

export {
    DropdownMenu,
    DropdownMenuPortal,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
};
