"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Signals when the first-paint loader has finished so on-load entrance animations
// hold until the overlay fades. True ~immediately for reduced-motion users.
const AppReadyContext = createContext(true);

export function useAppReady() {
    return useContext(AppReadyContext);
}

export function AppReadyProvider({ children }: { children: React.ReactNode }) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const reduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        // Start reveals early (150ms) so their entrance completes behind the
        // still-opaque loader — the overlay then fades onto an already-formed page.
        const timer = setTimeout(() => setReady(true), reduced ? 0 : 150);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AppReadyContext.Provider value={ready}>
            {children}
        </AppReadyContext.Provider>
    );
}
