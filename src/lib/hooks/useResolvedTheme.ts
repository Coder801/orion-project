"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * next-themes only knows the theme in the browser. Returns `undefined` during
 * SSR and hydration so theme-dependent attributes don't cause a mismatch.
 */
export function useResolvedTheme() {
    const { resolvedTheme, setTheme } = useTheme();
    const mounted = useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    );
    return {
        theme: mounted
            ? (resolvedTheme as "dark" | "light" | undefined)
            : undefined,
        setTheme,
    };
}
