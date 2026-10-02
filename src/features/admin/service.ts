import { getRepository, resetDemoData, withLatency } from "@/data/client";
import type { Repository } from "@/data/repository";
import type { ReviewInput } from "@/domain/audit";
import { DomainError } from "@/domain/errors";
import { applyRequest } from "@/domain/ledger";
import { parseDecimal } from "@/domain/money";
import { reviewCredit, reviewKyc } from "@/domain/review";
import type {
    AnyRequest,
    CreditApplication,
    KycSubmission,
    PlatformSettings,
    User,
} from "@/domain/types";
import { byNewest } from "@/features/user/service";

function assertAdmin(repo: Repository, adminId: string): void {
    if (repo.users.get(adminId)?.role !== "admin")
        throw new DomainError("forbidden");
}

/** Runs an admin-only read or command with simulated latency. */
function asAdmin<T>(
    adminId: string,
    work: (repo: Repository) => T,
): Promise<T> {
    return withLatency(() => {
        const repo = getRepository();
        assertAdmin(repo, adminId);
        return work(repo);
    });
}

export const listUsers = (adminId: string): Promise<User[]> =>
    asAdmin(adminId, (repo) => repo.users.list().sort(byNewest));

export const listKycSubmissions = (adminId: string): Promise<KycSubmission[]> =>
    asAdmin(adminId, (repo) => repo.kyc.list().sort(byNewest));

export const listRequests = (adminId: string): Promise<AnyRequest[]> =>
    asAdmin(adminId, (repo) => repo.requests.list().sort(byNewest));

export const listCreditApplications = (
    adminId: string,
): Promise<CreditApplication[]> =>
    asAdmin(adminId, (repo) => repo.credits.list().sort(byNewest));

export const reviewRequestAsAdmin = (input: ReviewInput) =>
    asAdmin(input.adminId, (repo) => applyRequest(repo, input).request);

export const reviewKycAsAdmin = (input: ReviewInput) =>
    asAdmin(input.adminId, (repo) => reviewKyc(repo, input).item);

export const reviewCreditAsAdmin = (input: ReviewInput) =>
    asAdmin(input.adminId, (repo) => reviewCredit(repo, input).item);

export function updatePlatformSettings(
    adminId: string,
    patch: Partial<PlatformSettings>,
): Promise<PlatformSettings> {
    return asAdmin(adminId, (repo) => {
        for (const price of Object.values(patch.usdPrices ?? {})) {
            if (parseDecimal(price).int <= 0n)
                throw new DomainError("invalidAmount");
        }
        return repo.settings.update(patch);
    });
}

export function resetDemo(adminId: string): Promise<null> {
    return asAdmin(adminId, () => {
        resetDemoData();
        return null;
    });
}
