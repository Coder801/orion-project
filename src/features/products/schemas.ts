import { z } from "zod";
import { amountSchema, requiredString } from "@/lib/validation";

export const CREDIT_TERMS = [6, 12, 24, 36] as const;
export const CREDIT_PURPOSES = [
    "personal",
    "education",
    "business",
    "other",
] as const;

// Credits are fiat-only and every fiat currency has 2 decimals.
export const creditSchema = z.object({
    currency: requiredString(),
    amount: amountSchema(2),
    termMonths: z.coerce
        .number<string>()
        .refine((v) => (CREDIT_TERMS as readonly number[]).includes(v), {
            error: "required",
        }),
    purpose: z.enum(CREDIT_PURPOSES, { error: "required" }),
    monthlyIncome: amountSchema(2),
});

export type CreditFormInput = z.input<typeof creditSchema>;
export type CreditValues = z.output<typeof creditSchema>;

export const CARD_TYPES = ["virtual", "physical"] as const;
export const CARD_TIERS = ["standard", "premium"] as const;

export const cardOrderSchema = z
    .object({
        type: z.enum(CARD_TYPES),
        tier: z.enum(CARD_TIERS),
        accountId: requiredString(),
        deliveryAddress: z.string().trim().max(200),
    })
    .refine((v) => v.type === "virtual" || v.deliveryAddress.length > 0, {
        error: "required",
        path: ["deliveryAddress"],
    });

export type CardOrderValues = z.infer<typeof cardOrderSchema>;

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
