import { describe, expect, it } from "vitest";
import { redirectFor } from "@/config/routes";

describe("redirectFor", () => {
    it("sends guests from protected areas to sign-in with a return path", () => {
        expect(redirectFor("/app/deposit", null)).toBe(
            "/auth/sign-in?next=%2Fapp%2Fdeposit",
        );
        expect(redirectFor("/admin/requests", null)).toBe(
            "/auth/sign-in?next=%2Fadmin%2Frequests",
        );
    });

    it("keeps each role in its own area", () => {
        expect(redirectFor("/admin/requests", "user")).toBe("/app/dashboard");
        expect(redirectFor("/app/dashboard", "admin")).toBe("/admin/users");
        expect(redirectFor("/admin/users/usr_demo", "user")).toBe(
            "/app/dashboard",
        );
        expect(redirectFor("/app/dashboard", "user")).toBeNull();
        expect(redirectFor("/admin/settings", "admin")).toBeNull();
    });

    it("moves signed-in users away from auth pages and leaves public pages alone", () => {
        expect(redirectFor("/auth/sign-in", "user")).toBe("/app/dashboard");
        expect(redirectFor("/auth/sign-in", null)).toBeNull();
        expect(redirectFor("/", null)).toBeNull();
    });
});
