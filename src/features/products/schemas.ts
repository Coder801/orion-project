import { z } from "zod";
import { cmpMinor, decimalToMinor } from "@/domain/money";
import type {
    CreditPurpose,
    CreditSettings,
    EmploymentStatus,
} from "@/domain/types";
import { amountSchema, requiredString } from "@/lib/validation";

export const CREDIT_PURPOSES = [
    "business",
    "realEstate",
    "vehicle",
    "education",
    "medical",
    "homeRenovation",
    "debtConsolidation",
    "travel",
    "other",
] as const satisfies readonly CreditPurpose[];

export const EMPLOYMENT_STATUSES = [
    "employed",
    "selfEmployed",
    "unemployed",
    "retired",
    "student",
] as const satisfies readonly EmploymentStatus[];

/** Wizard step 1; limits come from platform settings (credits are 2-decimal fiat). */
export function loanDetailsSchema(credit: CreditSettings) {
    return z.object({
        amount: amountSchema(2).refine(
            (value) => {
                try {
                    const amount = decimalToMinor(value, 2);
                    return (
                        cmpMinor(
                            amount,
                            decimalToMinor(credit.limits.min, 2),
                        ) >= 0 &&
                        cmpMinor(
                            amount,
                            decimalToMinor(credit.limits.max, 2),
                        ) <= 0
                    );
                } catch {
                    return true;
                }
            },
            { error: "amountOutOfRange" },
        ),
        purpose: z.enum(CREDIT_PURPOSES, { error: "required" }),
        termMonths: z
            .string()
            .trim()
            .regex(/^\d+$/, { error: "termRange" })
            .refine(
                (v) =>
                    Number(v) >= credit.termMonths.min &&
                    Number(v) <= credit.termMonths.max,
                { error: "termRange" },
            ),
    });
}

const optionalMoney = z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, { error: "amountFormat" });

export const financialInfoSchema = z.object({
    employment: z.enum(EMPLOYMENT_STATUSES, { error: "required" }),
    monthlyIncome: amountSchema(2),
    monthlyObligations: optionalMoney,
});

export const reviewSchema = z.object({
    consent: z.literal(true, { error: "consent" }),
});

export type LoanDetailsValues = z.infer<ReturnType<typeof loanDetailsSchema>>;
export type FinancialInfoValues = z.infer<typeof financialInfoSchema>;

export const TICKET_CATEGORIES = [
    "account",
    "payments",
    "verification",
    "other",
] as const;

export const ticketSchema = z.object({
    subject: requiredString().max(120),
    category: z.enum(TICKET_CATEGORIES, { error: "required" }),
    message: requiredString().max(2000),
});

export type TicketValues = z.infer<typeof ticketSchema>;
