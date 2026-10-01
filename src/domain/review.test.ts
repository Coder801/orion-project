import { beforeEach, describe, expect, it } from "vitest";
import { MockRepository } from "@/data/MockRepository";
import { createEmptyState } from "@/data/seed";
import { DomainError } from "@/domain/errors";
import { reviewKyc } from "@/domain/review";

let repo: MockRepository;

beforeEach(() => {
    repo = new MockRepository(createEmptyState());
    repo.users.insert({
        id: "u1",
        email: "a@x.test",
        name: "A",
        role: "user",
        kycStatus: "pending",
        createdAt: "",
    });
    repo.kyc.insert({
        id: "k1",
        userId: "u1",
        personal: {
            firstName: "A",
            lastName: "B",
            birthDate: "1990-01-01",
            country: "DE",
        },
        address: { line1: "x", city: "y", postalCode: "z" },
        document: { type: "passport", number: "1", files: [] },
        status: "pending",
        createdAt: "",
    });
});

describe("reviewKyc", () => {
    it("updates the user status, notifies and audits", () => {
        reviewKyc(repo, { id: "k1", decision: "approved", adminId: "adm" });
        expect(repo.users.get("u1")?.kycStatus).toBe("approved");
        expect(repo.notifications.list()).toMatchObject([
            { userId: "u1", subject: "kyc" },
        ]);
        expect(repo.audit.list()).toMatchObject([
            { entity: "kyc", to: "approved" },
        ]);
    });

    it("is idempotent and requires a reason to reject", () => {
        expect(() =>
            reviewKyc(repo, { id: "k1", decision: "rejected", adminId: "adm" }),
        ).toThrowError(new DomainError("reasonRequired"));
        reviewKyc(repo, {
            id: "k1",
            decision: "rejected",
            adminId: "adm",
            reason: "blurry",
        });
        const again = reviewKyc(repo, {
            id: "k1",
            decision: "approved",
            adminId: "adm",
        });
        expect(again.applied).toBe(false);
        expect(repo.users.get("u1")?.kycStatus).toBe("rejected");
        expect(repo.audit.list()).toHaveLength(1);
    });
});
