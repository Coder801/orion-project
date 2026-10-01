"use client";

import { ShieldAlertIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, type ReactNode } from "react";

import { PageLoader } from "@/components/layout/PageLoader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { homeFor, redirectFor, ROUTES } from "@/config/routes";
import { isKycApproved, type KycOperation } from "@/domain/rules";
import type { Role } from "@/domain/types";
import { useCurrentUser } from "@/features/auth/session";
import { useSignOut } from "@/features/auth/useSignOut";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useMeQuery } from "@/store/api";
import { selectSignedOut, selectUser } from "@/store/authSlice";
import { useAppSelector } from "@/store/hooks";

function Redirect({ to }: { to: string }) {
    const router = useRouter();
    useEffect(() => router.replace(to), [router, to]);
    return <PageLoader fullscreen />;
}

export function RequireAuth({ children }: { children: ReactNode }) {
    const user = useAppSelector(selectUser);
    const signedOut = useAppSelector(selectSignedOut);
    const pathname = usePathname();
    if (user) return children;
    // After an explicit sign-out the caller navigates away itself.
    if (signedOut) return <PageLoader fullscreen />;
    return <Redirect to={redirectFor(pathname, null) ?? ROUTES.signIn} />;
}

export function RequireRole({
    role,
    children,
}: {
    role: Role;
    children: ReactNode;
}) {
    const user = useCurrentUser();
    if (user.role !== role) return <Redirect to={homeFor(user.role)} />;
    return children;
}

/** Blocks operations until KYC is approved; the services enforce the same rule. */
export function RequireKyc({
    operation,
    children,
}: {
    operation: KycOperation;
    children: ReactNode;
}) {
    const t = useTranslations("kycGate");
    const user = useCurrentUser();
    const signOut = useSignOut();
    const {
        data: me,
        isLoading,
        isError,
        error,
        refetch,
    } = useMeQuery(user.id);

    // The mock DB was reset under an old session cookie.
    const missing = isError && "code" in error && error.code === "notFound";
    useEffect(() => {
        if (missing) signOut();
    }, [missing, signOut]);

    if (isLoading || missing) return <PageLoader />;
    if (isError || !me) return <ErrorState onRetry={refetch} />;
    if (isKycApproved(me)) return children;

    return (
        <EmptyState
            icon={ShieldAlertIcon}
            title={t("title")}
            description={t(`description.${me.kycStatus}`, {
                operation: t(`operations.${operation}`),
            })}
            action={
                me.kycStatus !== "pending" && (
                    <Button asChild variant="gradient">
                        <Link href={ROUTES.verification}>{t("action")}</Link>
                    </Button>
                )
            }
        />
    );
}
