import { z } from "zod";
import { requiredString } from "@/lib/validation";

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_FILE_TYPES = [
    "image/png",
    "image/jpeg",
    "application/pdf",
];
export const IMAGE_FILE_TYPES = ["image/png", "image/jpeg"];
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

function fileSchema(types: string[] = ACCEPTED_FILE_TYPES) {
    return z
        .custom<File>(
            (value) => typeof File !== "undefined" && value instanceof File,
            { error: "fileRequired" },
        )
        .refine((file) => file.size <= MAX_FILE_BYTES, {
            error: "fileTooLarge",
        })
        .refine((file) => types.includes(file.type), { error: "fileType" });
}

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
    document: z
        .object({
            type: z.enum(DOCUMENT_TYPES, { error: "required" }),
            number: requiredString().max(30),
            front: fileSchema(),
            back: fileSchema().optional(),
        })
        // A passport has one photo page; ID cards and licences have two sides.
        .refine((v) => v.type === "passport" || v.back !== undefined, {
            error: "fileRequired",
            path: ["back"],
        }),
    selfie: fileSchema(IMAGE_FILE_TYPES),
    address: z.object({
        line1: requiredString().max(100),
        city: requiredString().max(60),
        postalCode: requiredString().max(12),
        proof: fileSchema(),
    }),
});

export type KycValues = z.infer<typeof kycSchema>;

/** Form sections in step order; each step validates only its own section. */
export const KYC_STEPS = ["personal", "document", "selfie", "address"] as const;
export type KycStep = (typeof KYC_STEPS)[number];
