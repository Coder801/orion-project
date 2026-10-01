import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth, RequireRole } from "@/features/auth/guards";

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <RequireAuth>
            <RequireRole role="user">
                <AppShell variant="app">{children}</AppShell>
            </RequireRole>
        </RequireAuth>
    );
}
