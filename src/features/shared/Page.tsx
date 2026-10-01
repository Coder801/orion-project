import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import type { PageKey } from "@/lib/metadata";

/** Page title/description from `pages.<key>` plus the page body. */
export function Page({
    pageKey,
    children,
}: {
    pageKey: PageKey;
    children: ReactNode;
}) {
    const t = useTranslations("pages");
    return (
        <>
            <PageHeader
                title={t(`${pageKey}.title`)}
                description={t(`${pageKey}.description`)}
            />
            {children}
        </>
    );
}
