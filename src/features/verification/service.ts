import { getRepository, withLatency } from "@/data/client";
import { DomainError } from "@/domain/errors";
import type { KycSubmission } from "@/domain/types";
import { byNewest, requireUser } from "@/features/user/service";

export type KycInput = Pick<
    KycSubmission,
    "personal" | "address" | "document" | "selfie"
>;

export function getLatestKyc(userId: string): Promise<KycSubmission | null> {
    return withLatency(
        () =>
            getRepository()
                .kyc.list((k) => k.userId === userId)
                .sort(byNewest)[0] ?? null,
    );
}

export function submitKyc(
    userId: string,
    input: KycInput,
): Promise<KycSubmission> {
    return withLatency(() => {
        const repo = getRepository();
        return repo.transaction(() => {
            const user = requireUser(repo, userId);
            if (user.kycStatus === "pending" || user.kycStatus === "approved") {
                throw new DomainError("kycAlreadySubmitted");
            }
            const submission = repo.kyc.insert({
                id: repo.nextId("kyc"),
                userId,
                ...input,
                status: "pending",
                createdAt: repo.now(),
            });
            repo.users.update(userId, { kycStatus: "pending" });
            return submission;
        });
    });
}
