"use client";

import { useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { api, useSignOutMutation } from "@/store/api";
import { loggedOut, selectUser } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function useSignOut() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const user = useAppSelector(selectUser);
    const [revoke] = useSignOutMutation();
    return useCallback(() => {
        // Revoke the server-side session in the background; never block sign-out on it.
        if (user) void revoke({ userId: user.id, sessionId: user.sessionId });
        dispatch(loggedOut());
        dispatch(api.util.resetApiState());
        router.replace("/");
    }, [dispatch, revoke, router, user]);
}
