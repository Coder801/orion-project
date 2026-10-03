"use client";

import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";
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
    return <Provider store={store}>{children}</Provider>;
}
