import { describe, expect, it } from "vitest";
import { passwordChecks, strongPasswordSchema } from "@/lib/validation";

describe("password rules", () => {
    it("report each rule", () => {
        expect(passwordChecks("abc")).toEqual({
            length: false,
            mixedCase: false,
            digit: false,
            symbol: false,
        });
        expect(passwordChecks("Abcdefg1!")).toEqual({
            length: true,
            mixedCase: true,
            digit: true,
            symbol: true,
        });
    });

    it("require all rules for a new password", () => {
        expect(strongPasswordSchema.safeParse("abcdefgh").success).toBe(false);
        expect(strongPasswordSchema.safeParse("Abcdefg1!").success).toBe(true);
    });
});
