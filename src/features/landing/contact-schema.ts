import { z } from "zod";

import { emailSchema, requiredString } from "@/lib/validation";

export const CONTACT_TOPICS = ["general", "account", "partnership"] as const;

export const contactSchema = z.object({
    name: requiredString().max(70),
    email: emailSchema,
    topic: z.enum(CONTACT_TOPICS, { error: "required" }),
    message: requiredString().max(2000),
});

export type ContactValues = z.infer<typeof contactSchema>;
