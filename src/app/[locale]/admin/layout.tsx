import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth, RequireRole } from "@/features/auth/Guards";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <RequireAuth>
            <RequireRole role="admin">
                <AppShell variant="admin">{children}</AppShell>
            </RequireRole>
        </RequireAuth>
    );
}
