import { getRepository, withLatency } from "@/data/client";
import { DomainError } from "@/domain/errors";
import { decimalToMinor } from "@/domain/money";
import { requireEnabledCurrency } from "@/domain/rules";
import type {
    CardOrder,
    CardTier,
    CardType,
    CreditApplication,
    DecimalString,
    SupportTicket,
} from "@/domain/types";
import {
    byNewest,
    requireUser,
    requireVerifiedUser,
} from "@/features/user/service";

export interface CreditInput {
    amount: DecimalString;
    currency: string;
    termMonths: number;
    purpose: CreditApplication["purpose"];
    monthlyIncome: DecimalString;
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
        const currency = requireEnabledCurrency(
            repo.settings.get(),
            input.currency,
        );
        if (currency.type !== "fiat") throw new DomainError("currencyDisabled");
        return repo.credits.insert({
            id: repo.nextId("crd"),
            userId,
            amount: decimalToMinor(input.amount, currency.decimals),
            currency: currency.code,
            termMonths: input.termMonths,
            purpose: input.purpose,
            monthlyIncome: decimalToMinor(
                input.monthlyIncome,
                currency.decimals,
            ),
            status: "pending",
            createdAt: repo.now(),
        });
    });
}

export interface CardOrderInput {
    type: CardType;
    tier: CardTier;
    accountId: string;
    deliveryAddress?: string;
}

export function listCardOrders(userId: string): Promise<CardOrder[]> {
    return withLatency(() =>
        getRepository()
            .cardOrders.list((c) => c.userId === userId)
            .sort(byNewest),
    );
}

export function orderCard(
    userId: string,
    input: CardOrderInput,
): Promise<CardOrder> {
    return withLatency(() => {
        const repo = getRepository();
        requireVerifiedUser(repo, userId);
        const account = repo.accounts.get(input.accountId);
        if (!account || account.userId !== userId)
            throw new DomainError("notFound");
        return repo.cardOrders.insert({
            id: repo.nextId("card"),
            userId,
            type: input.type,
            tier: input.tier,
            accountId: account.id,
            deliveryAddress:
                input.type === "physical"
                    ? input.deliveryAddress?.trim()
                    : undefined,
            status: "pending",
            createdAt: repo.now(),
        });
    });
}

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
