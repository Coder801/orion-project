import {
    DEFAULT_CARD_PLANS,
    DEFAULT_CREDIT,
    DEFAULT_CURRENCIES,
    DEFAULT_FEES,
    DEFAULT_LIMITS,
    DEFAULT_PHYSICAL_CARD,
    DEFAULT_USD_PRICES,
} from "@/config/currencies";
import { DEFAULT_METHODS } from "@/config/methods";
import { MockRepository, type DbState } from "@/data/MockRepository";
import { applyRequest, submitRequest } from "@/domain/ledger";
import { feeFromBps } from "@/domain/money";
import type { Account, User } from "@/domain/types";

export const DB_VERSION = 2;

/** Demo sign-in accounts shown on the sign-in page (any password of 8+ chars works). */
export const DEMO_EMAILS = {
    user: "user@orion.test",
    newcomer: "new@orion.test",
    pending: "pending@orion.test",
    admin: "admin@orion.test",
} as const;

export function createEmptyState(): DbState {
    return {
        version: DB_VERSION,
        seq: 0,
        users: [],
        accounts: [],
        transactions: [],
        requests: [],
        kyc: [],
        credits: [],
        beneficiaries: [],
        sessions: [],
        tickets: [],
        notifications: [],
        audit: [],
        settings: {
            currencies: structuredClone(DEFAULT_CURRENCIES),
            methods: structuredClone(DEFAULT_METHODS),
            usdPrices: { ...DEFAULT_USD_PRICES },
            fees: { ...DEFAULT_FEES },
            limits: structuredClone(DEFAULT_LIMITS),
            cardPlans: structuredClone(DEFAULT_CARD_PLANS),
            physicalCard: structuredClone(DEFAULT_PHYSICAL_CARD),
            credit: structuredClone(DEFAULT_CREDIT),
        },
    };
}

const SEED_START = Date.parse("2026-01-05T09:00:00Z");
const SEED_STEP_MS = 7 * 60 * 60 * 1000;

function user(
    id: string,
    email: string,
    name: string,
    patch: Partial<User> = {},
): User {
    return {
        id,
        email,
        name,
        role: "user",
        kycStatus: "approved",
        createdAt: "2026-01-02T10:00:00.000Z",
        displayCurrency: "EUR",
        ...patch,
    };
}

function account(
    id: string,
    userId: string,
    currency: string,
    balance = "0",
): Account {
    return { id, userId, currency, balance, hold: "0" };
}

// Built through the real ledger functions so balances, holds and history stay consistent.
export function createSeed(): DbState {
    let tick = SEED_START;
    const repo = new MockRepository(createEmptyState(), {
        clock: () => new Date((tick += SEED_STEP_MS)),
    });
    const admin = "usr_admin";
    const fees = DEFAULT_FEES;

    repo.users.insert(
        user("usr_demo", DEMO_EMAILS.user, "Demo User", {
            phone: "+00 000 000 0000",
            country: "DE",
        }),
    );
    repo.users.insert(
        user("usr_new", DEMO_EMAILS.newcomer, "New User", {
            kycStatus: "none",
        }),
    );
    repo.users.insert(
        user("usr_pending", DEMO_EMAILS.pending, "Pending User", {
            kycStatus: "pending",
        }),
    );
    repo.users.insert(
        user(admin, DEMO_EMAILS.admin, "Admin", { role: "admin" }),
    );

    repo.accounts.insert(account("acc_demo_eur", "usr_demo", "EUR"));
    repo.accounts.insert(account("acc_demo_eur2", "usr_demo", "EUR"));
    repo.accounts.insert(account("acc_demo_usd", "usr_demo", "USD"));
    repo.accounts.insert(account("acc_demo_btc", "usr_demo", "BTC"));
    repo.accounts.insert(account("acc_new_eur", "usr_new", "EUR"));
    repo.accounts.insert(account("acc_new_usd", "usr_new", "USD"));
    repo.accounts.insert(account("acc_pending_eur", "usr_pending", "EUR"));

    const approve = (id: string) =>
        applyRequest(repo, { id, decision: "approved", adminId: admin });

    const deposit = (
        accountId: string,
        currency: string,
        amount: string,
        method: string,
    ) =>
        submitRequest(repo, {
            kind: "deposit",
            userId: "usr_demo",
            method,
            payload: { accountId, currency, amount, fee: "0", fields: {} },
        });

    approve(deposit("acc_demo_eur", "EUR", "1250000", "sepa-in").id);
    approve(deposit("acc_demo_usd", "USD", "420000", "wire-in").id);
    approve(deposit("acc_demo_btc", "BTC", "25000000", "crypto-in").id);
    approve(
        submitRequest(repo, {
            kind: "transfer",
            userId: "usr_demo",
            method: "internal",
            payload: {
                fromAccountId: "acc_demo_eur",
                currency: "EUR",
                amount: "80000",
                fee: "0",
                target: { kind: "own", accountId: "acc_demo_eur2" },
            },
        }).id,
    );
    const rejected = deposit("acc_demo_usd", "USD", "99900", "card-in");
    applyRequest(repo, {
        id: rejected.id,
        decision: "rejected",
        adminId: admin,
        reason: "Placeholder rejection reason",
    });

    // Still pending: funds of the debit requests sit in `hold`.
    deposit("acc_demo_usd", "USD", "100000", "wire-in");
    submitRequest(repo, {
        kind: "withdrawal",
        userId: "usr_demo",
        method: "sepa-out",
        payload: {
            accountId: "acc_demo_eur",
            currency: "EUR",
            amount: "20000",
            fee: feeFromBps("20000", fees.withdrawalBps),
            fields: {
                holderName: "Demo User",
                iban: "DE89370400440532013000",
                bic: "DEUTDEFF",
            },
        },
    });
    submitRequest(repo, {
        kind: "conversion",
        userId: "usr_demo",
        method: "rates",
        payload: {
            fromAccountId: "acc_demo_usd",
            from: "USD",
            to: "BTC",
            amount: "50000",
            fee: feeFromBps("50000", fees.conversionBps),
            rate: "0.000015625",
            toAmount: "781250",
        },
    });
    submitRequest(repo, {
        kind: "card",
        userId: "usr_demo",
        method: "card-plan",
        payload: {
            accountId: "acc_demo_eur2",
            currency: "EUR",
            amount: "499",
            fee: "0",
            product: { kind: "plan", plan: "plus" },
        },
    });

    repo.beneficiaries.insert({
        id: repo.nextId("ben"),
        userId: "usr_demo",
        rail: "sepa",
        name: "Placeholder Recipient",
        iban: "DE89370400440532013000",
        bic: "DEUTDEFF",
        createdAt: repo.now(),
    });

    for (const [device, hoursAgo] of [
        ["Browser · Desktop", 30],
        ["App · Mobile", 74],
    ] as const) {
        const at = new Date(tick - hoursAgo * 3_600_000).toISOString();
        repo.sessions.insert({
            id: repo.nextId("ses"),
            userId: "usr_demo",
            device,
            createdAt: at,
            lastActiveAt: at,
        });
    }

    repo.kyc.insert({
        id: repo.nextId("kyc"),
        userId: "usr_pending",
        personal: {
            firstName: "Pending",
            lastName: "User",
            birthDate: "1990-01-01",
            country: "DE",
        },
        address: {
            line1: "Placeholder street 1",
            city: "Placeholder city",
            postalCode: "00000",
            proof: [
                {
                    id: "blob_seed_3",
                    name: "proof-of-address.pdf",
                    size: 120544,
                    mimeType: "application/pdf",
                },
            ],
        },
        document: {
            type: "passport",
            number: "X0000000",
            files: [
                {
                    id: "blob_seed_1",
                    name: "document-front.png",
                    size: 48213,
                    mimeType: "image/png",
                },
            ],
        },
        selfie: {
            id: "blob_seed_2",
            name: "selfie.jpg",
            size: 35120,
            mimeType: "image/jpeg",
        },
        status: "pending",
        createdAt: repo.now(),
    });

    repo.credits.insert({
        id: repo.nextId("crd"),
        userId: "usr_demo",
        amount: "500000",
        currency: "EUR",
        termMonths: 12,
        purpose: "homeRenovation",
        employment: "employed",
        monthlyIncome: "350000",
        monthlyObligations: "40000",
        status: "pending",
        createdAt: repo.now(),
    });

    repo.tickets.insert({
        id: repo.nextId("tkt"),
        userId: "usr_demo",
        subject: "Placeholder subject",
        category: "payments",
        message: "Placeholder message",
        status: "answered",
        createdAt: repo.now(),
    });

    return repo.snapshot();
}
