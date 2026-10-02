"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

/** Human label for a request/transaction method id (`methods.*`), if known. */
export function useMethodLabel() {
    const t = useTranslations("methods");
    return useCallback(
        (method: string | undefined): string | undefined =>
            method && t.has(method as "sepa-in")
                ? t(method as "sepa-in")
                : undefined,
        [t],
    );
}
