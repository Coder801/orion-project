import { beforeEach, describe, expect, it } from "vitest";
import { MockRatesProvider } from "@/data/MockRatesProvider";
import { MockRepository } from "@/data/MockRepository";
import { createEmptyState } from "@/data/seed";
import { DomainError } from "@/domain/errors";
import { applyRequest, submitRequest } from "@/domain/ledger";
import type { Account } from "@/domain/types";

const ADMIN = "usr_admin";
let repo: MockRepository;

function balances(id: string): Pick<Account, "balance" | "hold"> {
    const account = repo.accounts.get(id);
    if (!account) throw new Error(`no account ${id}`);
    return { balance: account.balance, hold: account.hold };
}

function withdraw(amount: string, fee = "0") {
    return submitRequest(repo, {
        kind: "withdrawal",
        userId: "u1",
        method: "sepa-out",
        payload: { accountId: "eur", currency: "EUR", amount, fee, fields: {} },
    });
}

beforeEach(() => {
    repo = new MockRepository(createEmptyState(), {
        clock: () => new Date("2026-02-01T00:00:00Z"),
    });
    const base = {
        role: "user",
        kycStatus: "approved",
        createdAt: "",
    } as const;
    repo.users.insert({ id: "u1", email: "a@x.test", name: "A", ...base });
    repo.users.insert({ id: "u2", email: "b@x.test", name: "B", ...base });
    repo.accounts.insert({
        id: "eur",
        userId: "u1",
        currency: "EUR",
        balance: "10000",
        hold: "0",
    });
    repo.accounts.insert({
        id: "usd",
        userId: "u1",
        currency: "USD",
        balance: "5000",
        hold: "0",
    });
});

describe("deposits", () => {
    it("change the balance only after approval", () => {
        const request = submitRequest(repo, {
            kind: "deposit",
            userId: "u1",
            method: "sepa-in",
            payload: {
                accountId: "eur",
                currency: "EUR",
                amount: "2500",
                fee: "0",
                fields: {},
            },
        });
        expect(balances("eur")).toEqual({ balance: "10000", hold: "0" });

        applyRequest(repo, {
            id: request.id,
            decision: "approved",
            adminId: ADMIN,
        });
        expect(balances("eur")).toEqual({ balance: "12500", hold: "0" });
        expect(
            repo.transactions.list((tx) => tx.requestId === request.id)[0]
                ?.status,
        ).toBe("completed");
    });
});

describe("holds", () => {
    it("reserve amount + fee when a withdrawal is created", () => {
        withdraw("3000", "10");
        expect(balances("eur")).toEqual({ balance: "10000", hold: "3010" });
    });

    it("reject requests above the available balance", () => {
        withdraw("7000");
        expect(() => withdraw("3001")).toThrowError(
            new DomainError("insufficientFunds"),
        );
        expect(balances("eur").hold).toBe("7000");
    });

    it("are released on rejection without touching the balance", () => {
        const request = withdraw("3000", "10");
        applyRequest(repo, {
            id: request.id,
            decision: "rejected",
            adminId: ADMIN,
            reason: "r",
        });
        expect(balances("eur")).toEqual({ balance: "10000", hold: "0" });
        expect(
            repo.transactions.list((tx) => tx.requestId === request.id)[0]
                ?.status,
        ).toBe("failed");
    });

    it("are settled on approval", () => {
        const request = withdraw("3000", "10");
        applyRequest(repo, {
            id: request.id,
            decision: "approved",
            adminId: ADMIN,
        });
        expect(balances("eur")).toEqual({ balance: "6990", hold: "0" });
    });
});

describe("applyRequest", () => {
    it("is idempotent", () => {
        const request = withdraw("1000");
        const first = applyRequest(repo, {
            id: request.id,
            decision: "approved",
            adminId: ADMIN,
        });
        const second = applyRequest(repo, {
            id: request.id,
            decision: "approved",
            adminId: ADMIN,
        });
        const flipped = applyRequest(repo, {
            id: request.id,
            decision: "rejected",
            adminId: ADMIN,
            reason: "late",
        });

        expect(first.applied).toBe(true);
        expect(second.applied).toBe(false);
        expect(flipped.applied).toBe(false);
        expect(flipped.request.status).toBe("approved");
        expect(balances("eur")).toEqual({ balance: "9000", hold: "0" });
        expect(repo.notifications.list()).toHaveLength(1);
        expect(repo.audit.list()).toHaveLength(1);
    });

    it("is atomic: a failure rolls back every change", () => {
        const request = withdraw("4000");
        // Corrupt state so settlement fails midway (hold released, then balance check throws).
        repo.accounts.update("eur", { balance: "100" });
        const before = repo.snapshot();

        expect(() =>
            applyRequest(repo, {
                id: request.id,
                decision: "approved",
                adminId: ADMIN,
            }),
        ).toThrowError(DomainError);
        expect(repo.snapshot()).toEqual(before);
    });

    it("requires a reason to reject", () => {
        const request = withdraw("1000");
        expect(() =>
            applyRequest(repo, {
                id: request.id,
                decision: "rejected",
                adminId: ADMIN,
                reason: " ",
            }),
        ).toThrowError(new DomainError("reasonRequired"));
        expect(repo.requests.get(request.id)?.status).toBe("pending");
    });

    it("notifies the user and writes an audit entry", () => {
        const request = withdraw("1000");
        applyRequest(repo, {
            id: request.id,
            decision: "rejected",
            adminId: ADMIN,
            reason: "why",
        });
        expect(repo.notifications.list()[0]).toMatchObject({
            userId: "u1",
            entityId: request.id,
            status: "rejected",
            reason: "why",
        });
        expect(repo.audit.list()[0]).toMatchObject({
            actorId: ADMIN,
            from: "pending",
            to: "rejected",
        });
    });
});

describe("transfers", () => {
    it("move funds to another user on approval", () => {
        const request = submitRequest(repo, {
            kind: "transfer",
            userId: "u1",
            method: "internal",
            payload: {
                fromAccountId: "eur",
                currency: "EUR",
                amount: "1500",
                fee: "0",
                target: { kind: "user", email: "b@x.test", userId: "u2" },
            },
        });
        applyRequest(repo, {
            id: request.id,
            decision: "approved",
            adminId: ADMIN,
        });

        expect(balances("eur")).toEqual({ balance: "8500", hold: "0" });
        const recipient = repo.accounts.list(
            (a) => a.userId === "u2" && a.currency === "EUR",
        );
        expect(recipient.map((a) => a.balance)).toEqual(["1500"]);
    });

    it("refuse sending to yourself", () => {
        expect(() =>
            submitRequest(repo, {
                kind: "transfer",
                userId: "u1",
                method: "internal",
                payload: {
                    fromAccountId: "eur",
                    currency: "EUR",
                    amount: "1",
                    fee: "0",
                    target: { kind: "user", email: "a@x.test", userId: "u1" },
                },
            }),
        ).toThrowError(new DomainError("recipientSelf"));
    });
});

describe("conversions", () => {
    it("lock the quoted amount and credit the target currency on approval", () => {
        const rates = new MockRatesProvider(() => repo.settings.get());
        const quote = rates.quote("USD", "EUR", "1080"); // 10.80 USD
        expect(quote.toAmount).toBe("1000"); // 10.00 EUR at 1.08
        expect(quote.fee).toBe("6"); // 50 bps, rounded up

        const request = submitRequest(repo, {
            kind: "conversion",
            userId: "u1",
            method: "rates",
            payload: { fromAccountId: "usd", ...quote },
        });
        expect(balances("usd")).toEqual({ balance: "5000", hold: "1086" });

        // Later rate changes don't affect a submitted request.
        repo.settings.update({
            usdPrices: { ...repo.settings.get().usdPrices, EUR: "2" },
        });
        applyRequest(repo, {
            id: request.id,
            decision: "approved",
            adminId: ADMIN,
        });

        expect(balances("usd")).toEqual({ balance: "3914", hold: "0" });
        expect(balances("eur")).toEqual({ balance: "11000", hold: "0" });
    });

    it("create the target account when missing", () => {
        const rates = new MockRatesProvider(() => repo.settings.get());
        const quote = rates.quote("USD", "BTC", "3200");
        const request = submitRequest(repo, {
            kind: "conversion",
            userId: "u1",
            method: "rates",
            payload: { fromAccountId: "usd", ...quote },
        });
        applyRequest(repo, {
            id: request.id,
            decision: "approved",
            adminId: ADMIN,
        });
        const btc = repo.accounts.list(
            (a) => a.userId === "u1" && a.currency === "BTC",
        );
        expect(btc.map((a) => a.balance)).toEqual(["50000"]); // 32 USD = 0.0005 BTC
    });
});
