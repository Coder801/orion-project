import { describe, expect, it } from "vitest";
import { DEFAULT_CARD_PLANS } from "@/config/currencies";
import { canSelectPlan, currentPlan, requirePlanUpgrade } from "@/domain/cards";
import { DomainError } from "@/domain/errors";
import { createEmptyState } from "@/data/seed";

const plans = DEFAULT_CARD_PLANS;
const byId = (id: string) => plans.find((p) => p.id === id)!;

describe("card plans", () => {
    it("default to the lowest rank", () => {
        expect(currentPlan(plans, {})?.id).toBe("basic");
        expect(currentPlan(plans, { cardPlan: "premium" })?.id).toBe("premium");
    });

    it("can only be upgraded", () => {
        expect(canSelectPlan(byId("plus"), byId("premium"))).toBe(true);
        expect(canSelectPlan(byId("premium"), byId("premium"))).toBe(false);
        expect(canSelectPlan(byId("premium"), byId("plus"))).toBe(false);
    });

    it("reject downgrades and unknown plans in the service rule", () => {
        const { settings } = createEmptyState();
        expect(requirePlanUpgrade(settings, {}, "elite").id).toBe("elite");
        expect(() =>
            requirePlanUpgrade(settings, { cardPlan: "elite" }, "plus"),
        ).toThrowError(new DomainError("planUnavailable"));
        expect(() => requirePlanUpgrade(settings, {}, "nope")).toThrowError(
            new DomainError("planUnavailable"),
        );
    });
});
