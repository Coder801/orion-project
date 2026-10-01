import type { Role } from "@/domain/types";

export type Language = "en";

/** What the session cookie carries; the full user lives in the repository. */
export interface SessionUser {
    id: string;
    email: string;
    name: string;
    role: Role;
}
