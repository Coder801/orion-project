import { getRepository, withLatency } from "@/data/client";
import { DomainError } from "@/domain/errors";
import { ensureAccount } from "@/domain/ledger";
import type { User } from "@/domain/types";
import type { SessionUser } from "@/types";

export function toSession({ id, email, name, role }: User): SessionUser {
    return { id, email, name, role };
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

// Demo auth: passwords are validated by the form but never stored or compared.
export function signIn(email: string): Promise<SessionUser> {
    return withLatency(() => {
        const user = getRepository().users.list(
            (u) => u.email === normalizeEmail(email),
        )[0];
        if (!user) throw new DomainError("invalidCredentials");
        return toSession(user);
    });
}

export function signUp(input: {
    name: string;
    email: string;
}): Promise<SessionUser> {
    return withLatency(() => {
        const repo = getRepository();
        return repo.transaction(() => {
            const email = normalizeEmail(input.email);
            if (repo.users.list((u) => u.email === email).length > 0) {
                throw new DomainError("emailTaken");
            }
            const user = repo.users.insert({
                id: repo.nextId("usr"),
                email,
                name: input.name.trim(),
                role: "user",
                kycStatus: "none",
                createdAt: repo.now(),
            });
            for (const currency of repo.settings.get().currencies) {
                if (currency.enabled && currency.type === "fiat")
                    ensureAccount(repo, user.id, currency.code);
            }
            return toSession(user);
        });
    });
}

/** Always succeeds (for any email) so the form doesn't reveal which emails exist. */
export function requestPasswordReset(): Promise<null> {
    // RTK Query rejects `{ data: undefined }`, so "no payload" is null.
    return withLatency(() => null);
}
