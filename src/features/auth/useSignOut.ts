"use client";

import { useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { api, useSignOutMutation } from "@/store/api";
import { loggedOut } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";

export function useSignOut() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [revoke] = useSignOutMutation();
    return useCallback(() => {
        // Revoke the API session in the background; never block sign-out on it.
        void revoke();
        dispatch(loggedOut());
        dispatch(api.util.resetApiState());
        router.replace("/");
    }, [dispatch, revoke, router]);
}
