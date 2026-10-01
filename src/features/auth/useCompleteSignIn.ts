"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { homeFor, redirectFor } from "@/config/routes";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/store/api";
import { loggedIn } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";
import type { SessionUser } from "@/types";

/** Stores the session and returns to `?next=` when the role may open it. */
export function useCompleteSignIn() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const next = useSearchParams().get("next");

    return useCallback(
        (user: SessionUser) => {
            dispatch(api.util.resetApiState());
            dispatch(loggedIn(user));
            const safeNext =
                next?.startsWith("/") && !next.startsWith("//") ? next : null;
            router.replace(
                safeNext && !redirectFor(safeNext, user.role)
                    ? safeNext
                    : homeFor(user.role),
            );
        },
        [dispatch, next, router],
    );
}
