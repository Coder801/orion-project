"use client";

import { useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/store/api";
import { loggedOut } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";

export function useSignOut() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    return useCallback(() => {
        dispatch(loggedOut());
        dispatch(api.util.resetApiState());
        router.replace("/");
    }, [dispatch, router]);
}
