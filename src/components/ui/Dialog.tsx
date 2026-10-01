"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { asChildProps } from "@/lib/base-ui";

function Dialog({
    children,
    ...props
}: Omit<React.ComponentProps<typeof DialogPrimitive.Root>, "children"> & {
    children?: React.ReactNode;
}) {
    return <DialogPrimitive.Root {...props}>{children}</DialogPrimitive.Root>;
}

function DialogTrigger({
    asChild,
    children,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger> & {
    asChild?: boolean;
}) {
    return (
        <DialogPrimitive.Trigger
            {...props}
            {...asChildProps(asChild, children)}
        />
    );
}

function DialogPortal(
    props: React.ComponentProps<typeof DialogPrimitive.Portal>,
) {
    return <DialogPrimitive.Portal {...props} />;
}

function DialogClose({
    asChild,
    children,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Close> & {
    asChild?: boolean;
}) {
    return (
        <DialogPrimitive.Close
            {...props}
            {...asChildProps(asChild, children)}
        />
    );
}

function DialogOverlay({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Backdrop>) {
    return (
        <DialogPrimitive.Backdrop
            className={cn(
                "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-200",
                "data-ending-style:opacity-0 data-starting-style:opacity-0",
                className,
            )}
            {...props}
        />
    );
}

function DialogContent({
    className,
    children,
    showCloseButton = true,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Popup> & {
    showCloseButton?: boolean;
}) {
    const t = useTranslations("common");
    return (
        <DialogPrimitive.Portal>
            <DialogOverlay />
            <DialogPrimitive.Popup
                className={cn(
                    "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl border bg-popover p-6 text-popover-foreground shadow-2xl sm:max-w-lg",
                    "transition-[transform,opacity,scale] duration-200",
                    "data-starting-style:scale-95 data-starting-style:opacity-0",
                    "data-ending-style:scale-95 data-ending-style:opacity-0",
                    className,
                )}
                {...props}
            >
                {children}
                {showCloseButton && (
                    <DialogPrimitive.Close className="absolute top-4 right-4 cursor-pointer rounded-md opacity-70 outline-hidden transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
                        <XIcon />
                        <span className="sr-only">{t("close")}</span>
                    </DialogPrimitive.Close>
                )}
            </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
    );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            className={cn(
                "flex flex-col gap-2 text-center sm:text-left",
                className,
            )}
            {...props}
        />
    );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            className={cn(
                "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
                className,
            )}
            {...props}
        />
    );
}

function DialogTitle({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
    return (
        <DialogPrimitive.Title
            className={cn(
                "font-heading text-lg leading-none font-semibold",
                className,
            )}
            {...props}
        />
    );
}

function DialogDescription({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
    return (
        <DialogPrimitive.Description
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    );
}

export {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
};
