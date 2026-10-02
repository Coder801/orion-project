import type { Collection, Repository } from "@/data/repository";
import {
    normalizeReason,
    recordStatusChange,
    type ReviewInput,
} from "@/domain/audit";
import { DomainError } from "@/domain/errors";
import type { ReviewEntity, ReviewStatus } from "@/domain/types";

type SimpleEntity = Exclude<ReviewEntity, "request">;

interface Reviewable {
    id: string;
    userId: string;
    status: ReviewStatus;
    reviewedBy?: string;
    reason?: string;
    reviewedAt?: string;
}

/** Shared review flow for non-monetary entities; idempotent like `applyRequest`. */
function review<T extends Reviewable>(
    repo: Repository,
    collection: Collection<T>,
    entity: SimpleEntity,
    input: ReviewInput,
    onDecision?: (item: T) => void,
): { item: T; applied: boolean } {
    return repo.transaction(() => {
        const item = collection.get(input.id);
        if (!item) throw new DomainError("notFound");
        if (item.status !== "pending") return { item, applied: false };
        const reason = normalizeReason(input.decision, input.reason);
        const updated = collection.update(item.id, {
            status: input.decision,
            reviewedBy: input.adminId,
            reason,
            reviewedAt: repo.now(),
        } as Partial<T>);
        onDecision?.(updated);
        recordStatusChange(repo, {
            actorId: input.adminId,
            userId: item.userId,
            entity,
            entityId: item.id,
            subject: entity,
            from: "pending",
            to: input.decision,
            reason,
        });
        return { item: updated, applied: true };
    });
}

export function reviewKyc(repo: Repository, input: ReviewInput) {
    return review(repo, repo.kyc, "kyc", input, (submission) => {
        repo.users.update(submission.userId, { kycStatus: submission.status });
    });
}

export function reviewCredit(repo: Repository, input: ReviewInput) {
    return review(repo, repo.credits, "credit", input);
}
