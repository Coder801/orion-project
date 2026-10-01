"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { isValidationKey } from "@/lib/validation";
import type { ApiError } from "@/store/api";

/** Translates a zod message key (see lib/validation) into the UI language. */
export function useFieldError() {
    const t = useTranslations("validation");
    return useCallback(
        (error: { message?: string } | undefined): string | undefined => {
            if (!error) return undefined;
            return isValidationKey(error.message)
                ? t(error.message)
                : t("required");
        },
        [t],
    );
}

function isApiError(error: unknown): error is ApiError {
    return typeof error === "object" && error !== null && "code" in error;
}

/** Message for an RTK Query error coming from the mock backend. */
export function useApiErrorMessage() {
    const t = useTranslations("domainErrors");
    return useCallback(
        (error: unknown): string | undefined => {
            if (!error) return undefined;
            return isApiError(error) ? t(error.code) : t("unknown");
        },
        [t],
    );
}
