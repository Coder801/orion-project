import { withLatency } from "@/data/client";
import type { ContactValues } from "@/features/landing/contact-schema";

/** Demo only: the message is validated and dropped — nothing is stored or sent. */
export function sendContactMessage(input: ContactValues): Promise<null> {
    void input;
    return withLatency(() => null);
}
