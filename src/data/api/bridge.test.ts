import { beforeEach, describe, expect, it } from "vitest";
import { mirrorUser } from "@/data/api/bridge";
import type { ApiUser } from "@/data/api/types";
import { MockRepository } from "@/data/MockRepository";
import { createEmptyState } from "@/data/seed";

const apiUser: ApiUser = {
    id: "usr_x",
    email: "x@orion.test",
    name: "X",
    role: "user",
    kycStatus: "none",
    createdAt: "2026-10-01T00:00:00Z",
    phone: null,
    country: "DE",
    displayCurrency: "USD",
    twoFactorEnabled: false,
    cardPlan: "basic",
};

let repo: MockRepository;
beforeEach(() => {
    repo = new MockRepository(createEmptyState());
});

describe("mirrorUser", () => {
    it("creates an unknown user with fiat accounts", () => {
        const user = mirrorUser(repo, apiUser);
        expect(user).toMatchObject({ id: "usr_x", phone: undefined });
        const currencies = repo.accounts
            .list((a) => a.userId === "usr_x")
            .map((a) => a.currency);
        const fiat = repo.settings
            .get()
            .currencies.filter((c) => c.enabled && c.type === "fiat")
            .map((c) => c.code);
        expect(currencies.sort()).toEqual(fiat.sort());
    });

    it("keeps mock-owned fields and refreshes the profile", () => {
        mirrorUser(repo, apiUser);
        repo.users.update("usr_x", { kycStatus: "approved", cardPlan: "plus" });
        const user = mirrorUser(repo, {
            ...apiUser,
            name: "Renamed",
            kycStatus: "none",
            cardPlan: "basic",
        });
        expect(user).toMatchObject({
            name: "Renamed",
            kycStatus: "approved",
            cardPlan: "plus",
        });
    });

    it("gives admins no accounts", () => {
        mirrorUser(repo, { ...apiUser, id: "usr_a", role: "admin" });
        expect(repo.accounts.list((a) => a.userId === "usr_a")).toEqual([]);
    });
});
