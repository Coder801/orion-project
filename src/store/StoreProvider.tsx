"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { saveSession } from "@/store/persistence";
import { makeStore, type RootState } from "@/store/store";

interface StoreProviderProps {
    preloadedState: Partial<RootState>;
    children: ReactNode;
}

export function StoreProvider({
    preloadedState,
    children,
}: StoreProviderProps) {
    const [store] = useState(() => makeStore(preloadedState));

    useEffect(() => {
        let previous = store.getState();
        return store.subscribe(() => {
            const next = store.getState();
            if (next.auth.user !== previous.auth.user)
                saveSession(next.auth.user);
            previous = next;
        });
    }, [store]);

    return <Provider store={store}>{children}</Provider>;
}
