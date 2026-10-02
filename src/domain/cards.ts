import { DomainError } from "@/domain/errors";
import type { CardPlan, PlatformSettings, User } from "@/domain/types";

/** The user's plan, falling back to the lowest-ranked one. */
export function currentPlan(
    plans: CardPlan[],
    user: Pick<User, "cardPlan">,
): CardPlan | undefined {
    const sorted = [...plans].sort((a, b) => a.rank - b.rank);
    return sorted.find((p) => p.id === user.cardPlan) ?? sorted[0];
}

/** Only upgrades are sold; the current and lower plans can't be bought. */
export function canSelectPlan(
    current: CardPlan | undefined,
    target: CardPlan,
): boolean {
    return !current || target.rank > current.rank;
}

export function requirePlanUpgrade(
    settings: PlatformSettings,
    user: Pick<User, "cardPlan">,
    planId: string,
): CardPlan {
    const target = settings.cardPlans.find((p) => p.id === planId);
    if (!target) throw new DomainError("planUnavailable");
    if (!canSelectPlan(currentPlan(settings.cardPlans, user), target))
        throw new DomainError("planUnavailable");
    return target;
}
