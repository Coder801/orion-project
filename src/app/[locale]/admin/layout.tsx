import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth, RequireRole } from "@/features/auth/guards";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <RequireAuth>
            <RequireRole role="admin">
                <AppShell variant="admin">{children}</AppShell>
            </RequireRole>
        </RequireAuth>
    );
}
