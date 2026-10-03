import { mirrorUser } from "@/data/api/bridge";
import { apiRequest } from "@/data/api/http";
import type { ApiMe } from "@/data/api/types";
import { getRepository } from "@/data/client";
import type { SessionUser } from "@/types";

export function toSession({ user, sessionId }: ApiMe): SessionUser {
    const { id, email, name, role } = user;
    return { id, email, name, role, sessionId };
}

/** Session from the API, with the user mirrored into the mock wallet DB. */
function established(me: ApiMe): SessionUser {
    mirrorUser(getRepository(), me.user);
    return toSession(me);
}

export interface SignInInput {
    email: string;
    password: string;
}

export interface SignUpInput extends SignInInput {
    name: string;
}

export async function signIn(input: SignInInput): Promise<SessionUser> {
    return established(
        await apiRequest<ApiMe>("POST", "/auth/sign-in", {
            email: input.email.trim(),
            password: input.password,
        }),
    );
}

export async function signUp(input: SignUpInput): Promise<SessionUser> {
    return established(
        await apiRequest<ApiMe>("POST", "/auth/sign-up", {
            name: input.name.trim(),
            email: input.email.trim(),
            password: input.password,
        }),
    );
}

/** Revokes the session and clears its cookie; signing out locally never waits for it. */
export function signOut(): Promise<null> {
    return apiRequest<null>("POST", "/auth/sign-out").catch(() => null);
}

/** Always succeeds (for any email) so the form doesn't reveal which emails exist. */
export function requestPasswordReset(email: string): Promise<null> {
    return apiRequest<null>("POST", "/auth/forgot-password", {
        email: email.trim(),
    });
}
