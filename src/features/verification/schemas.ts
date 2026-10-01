import { z } from "zod";
import { requiredString } from "@/lib/validation";

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_FILE_TYPES = [
    "image/png",
    "image/jpeg",
    "application/pdf",
];
export const DOCUMENT_TYPES = ["passport", "idCard", "driverLicense"] as const;
export const COUNTRIES = [
    "DE",
    "FR",
    "ES",
    "IT",
    "NL",
    "GB",
    "US",
    "OTHER",
] as const;

const fileSchema = z
    .custom<File>(
        (value) => typeof File !== "undefined" && value instanceof File,
        {
            error: "fileRequired",
        },
    )
    .refine((file) => file.size <= MAX_FILE_BYTES, { error: "fileTooLarge" })
    .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
        error: "fileType",
    });

function isAdultBirthDate(value: string, now = new Date()): boolean {
    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return false;
    const adult = new Date(date);
    adult.setUTCFullYear(date.getUTCFullYear() + 18);
    return adult <= now && date.getUTCFullYear() >= 1900;
}

export const kycSchema = z.object({
    personal: z.object({
        firstName: requiredString().max(50),
        lastName: requiredString().max(50),
        birthDate: requiredString().refine((v) => isAdultBirthDate(v), {
            error: "birthDate",
        }),
        country: z.enum(COUNTRIES, { error: "required" }),
    }),
    address: z.object({
        line1: requiredString().max(100),
        city: requiredString().max(60),
        postalCode: requiredString().max(12),
    }),
    document: z.object({
        type: z.enum(DOCUMENT_TYPES, { error: "required" }),
        number: requiredString().max(30),
        files: z.array(fileSchema).min(1, { error: "fileRequired" }).max(3),
    }),
});

export type KycValues = z.infer<typeof kycSchema>;

/** Form sections in step order; each step validates only its own section. */
export const KYC_STEPS = ["personal", "address", "document"] as const;
export type KycStep = (typeof KYC_STEPS)[number];
