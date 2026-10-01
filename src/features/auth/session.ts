"use client";

import { selectUser } from "@/store/authSlice";
import { useAppSelector } from "@/store/hooks";
import type { SessionUser } from "@/types";

/** Session user inside a <RequireAuth> tree, where it is guaranteed to exist. */
export function useCurrentUser(): SessionUser {
    const user = useAppSelector(selectUser);
    if (!user)
        throw new Error("useCurrentUser must be used inside <RequireAuth>");
    return user;
}
