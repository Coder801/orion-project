import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth, RequireRole } from "@/features/auth/Guards";

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <RequireAuth>
            <RequireRole role="user">
                <AppShell variant="app">{children}</AppShell>
            </RequireRole>
        </RequireAuth>
    );
}
