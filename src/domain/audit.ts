import type { Repository } from "@/data/repository";
import { DomainError } from "@/domain/errors";
import type {
    NotificationSubject,
    ReviewDecision,
    ReviewEntity,
    ReviewStatus,
} from "@/domain/types";

interface StatusChange {
    actorId: string;
    userId: string;
    entity: ReviewEntity;
    entityId: string;
    subject: NotificationSubject;
    from: ReviewStatus;
    to: ReviewStatus;
    reason?: string;
}

/** Every status change notifies the owner and leaves an audit trail. */
export function recordStatusChange(
    repo: Repository,
    change: StatusChange,
): void {
    const createdAt = repo.now();
    repo.notifications.insert({
        id: repo.nextId("ntf"),
        userId: change.userId,
        entity: change.entity,
        entityId: change.entityId,
        subject: change.subject,
        status: change.to,
        reason: change.reason,
        read: false,
        createdAt,
    });
    repo.audit.insert({
        id: repo.nextId("aud"),
        actorId: change.actorId,
        entity: change.entity,
        entityId: change.entityId,
        from: change.from,
        to: change.to,
        reason: change.reason,
        createdAt,
    });
}

export interface ReviewInput {
    id: string;
    decision: ReviewDecision;
    adminId: string;
    reason?: string;
}

/** Rejections must explain themselves to the user. */
export function normalizeReason(
    decision: ReviewDecision,
    reason: string | undefined,
) {
    const trimmed = reason?.trim() || undefined;
    if (decision === "rejected" && !trimmed)
        throw new DomainError("reasonRequired");
    return trimmed;
}
