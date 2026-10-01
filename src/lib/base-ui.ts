import * as React from "react";

/** Map shadcn's `asChild` API onto Base UI's `render` prop. */
export function asChildProps(
    asChild: boolean | undefined,
    children: React.ReactNode,
) {
    return asChild && React.isValidElement(children)
        ? { render: children as React.ReactElement<Record<string, unknown>> }
        : { children };
}

/** Shared enter/exit motion for floating popups. Dialog is excluded — own timing. */
export const popupMotion =
    "origin-(--transform-origin) transition-[transform,opacity] duration-150 " +
    "data-starting-style:scale-95 data-starting-style:opacity-0 " +
    "data-ending-style:scale-95 data-ending-style:opacity-0";
