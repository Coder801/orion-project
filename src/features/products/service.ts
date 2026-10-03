import { assertMoneyMovementOpen } from "@/data/api/bridge";
import { getRepository, withLatency } from "@/data/client";
import type { Repository } from "@/data/repository";
import { requirePlanUpgrade } from "@/domain/cards";
import { DomainError } from "@/domain/errors";
import { submitRequest } from "@/domain/ledger";
import { cmpMinor, decimalToMinor, ZERO } from "@/domain/money";
import { requireEnabledCurrency } from "@/domain/rules";
import type {
    AnyRequest,
    CardProduct,
    CreditApplication,
    CreditPurpose,
    DecimalString,
    EmploymentStatus,
    Minor,
    SupportTicket,
} from "@/domain/types";
import {
    byNewest,
    requireUser,
    requireVerifiedUser,
} from "@/features/user/service";

export interface CreditInput {
    amount: DecimalString;
    termMonths: number;
    purpose: CreditPurpose;
    employment: EmploymentStatus;
    monthlyIncome: DecimalString;
    monthlyObligations: DecimalString;
}

export function listCredits(userId: string): Promise<CreditApplication[]> {
    return withLatency(() =>
        getRepository()
            .credits.list((c) => c.userId === userId)
            .sort(byNewest),
    );
}

export function applyForCredit(
    userId: string,
    input: CreditInput,
): Promise<CreditApplication> {
    return withLatency(() => {
        const repo = getRepository();
        requireVerifiedUser(repo, userId);
        const settings = repo.settings.get();
        const { credit } = settings;
        const currency = requireEnabledCurrency(settings, credit.currency);
        const amount = decimalToMinor(input.amount, currency.decimals);
        if (
            cmpMinor(
                amount,
                decimalToMinor(credit.limits.min, currency.decimals),
            ) < 0 ||
            cmpMinor(
                amount,
                decimalToMinor(credit.limits.max, currency.decimals),
            ) > 0
        ) {
            throw new DomainError("amountOutOfRange");
        }
        if (
            !Number.isInteger(input.termMonths) ||
            input.termMonths < credit.termMonths.min ||
            input.termMonths > credit.termMonths.max
        ) {
            throw new DomainError("amountOutOfRange");
        }
        return repo.credits.insert({
            id: repo.nextId("crd"),
            userId,
            amount,
            currency: currency.code,
            termMonths: input.termMonths,
            purpose: input.purpose,
            employment: input.employment,
            monthlyIncome: decimalToMinor(
                input.monthlyIncome,
                currency.decimals,
            ),
            monthlyObligations: decimalToMinor(
                input.monthlyObligations,
                currency.decimals,
            ),
            status: "pending",
            createdAt: repo.now(),
        });
    });
}

// ─── Cards ──────────────────────────────────────────────────────────────────

function hasPendingCardRequest(
    repo: Repository,
    userId: string,
    kind: CardProduct["kind"],
): boolean {
    return repo.requests
        .list((r) => r.userId === userId && r.status === "pending")
        .some((r) => r.kind === "card" && r.payload.product.kind === kind);
}

function payForCard(
    repo: Repository,
    userId: string,
    accountId: string,
    price: { amount: Minor; currency: string },
    product: CardProduct,
): AnyRequest {
    const account = repo.accounts.get(accountId);
    if (!account || account.userId !== userId)
        throw new DomainError("notFound");
    if (account.currency !== price.currency)
        throw new DomainError("currencyMismatch");
    return submitRequest(repo, {
        kind: "card",
        userId,
        method: product.kind === "plan" ? "card-plan" : "physical-card",
        payload: {
            accountId: account.id,
            currency: account.currency,
            amount: price.amount,
            fee: ZERO,
            product,
        },
    });
}

export interface CardPlanInput {
    plan: string;
    accountId: string;
}

/**
 * Buys an upgrade: the price is held now and charged in one ledger entry when
 * an admin approves; the plan switches at the same moment.
 */
export function selectCardPlan(
    userId: string,
    input: CardPlanInput,
): Promise<AnyRequest> {
    assertMoneyMovementOpen();
    return withLatency(() => {
        const repo = getRepository();
        const user = requireVerifiedUser(repo, userId);
        const plan = requirePlanUpgrade(repo.settings.get(), user, input.plan);
        if (!(cmpMinor(plan.price, ZERO) > 0))
            throw new DomainError("planUnavailable");
        if (hasPendingCardRequest(repo, userId, "plan"))
            throw new DomainError("requestPending");
        return payForCard(
            repo,
            userId,
            input.accountId,
            { amount: plan.price, currency: plan.currency },
            { kind: "plan", plan: plan.id },
        );
    });
}

export interface PhysicalCardInput {
    accountId: string;
    deliveryAddress: string;
}

export function orderPhysicalCard(
    userId: string,
    input: PhysicalCardInput,
): Promise<AnyRequest> {
    assertMoneyMovementOpen();
    return withLatency(() => {
        const repo = getRepository();
        requireVerifiedUser(repo, userId);
        const address = input.deliveryAddress.trim();
        if (!address) throw new DomainError("invalidDetails");
        if (hasPendingCardRequest(repo, userId, "physicalCard"))
            throw new DomainError("requestPending");
        const offer = repo.settings.get().physicalCard;
        return payForCard(
            repo,
            userId,
            input.accountId,
            { amount: offer.price, currency: offer.currency },
            { kind: "physicalCard", deliveryAddress: address.slice(0, 200) },
        );
    });
}

// ─── Support ────────────────────────────────────────────────────────────────

export type TicketInput = Pick<
    SupportTicket,
    "subject" | "category" | "message"
>;

export function listTickets(userId: string): Promise<SupportTicket[]> {
    return withLatency(() =>
        getRepository()
            .tickets.list((t) => t.userId === userId)
            .sort(byNewest),
    );
}

export function createTicket(
    userId: string,
    input: TicketInput,
): Promise<SupportTicket> {
    return withLatency(() => {
        const repo = getRepository();
        requireUser(repo, userId);
        return repo.tickets.insert({
            id: repo.nextId("tkt"),
            userId,
            subject: input.subject.trim(),
            category: input.category,
            message: input.message.trim(),
            status: "open",
            createdAt: repo.now(),
        });
    });
}
