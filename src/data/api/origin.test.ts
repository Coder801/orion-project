import { afterEach, describe, expect, it, vi } from "vitest";
import { apiOrigin } from "@/data/api/origin";

afterEach(() => vi.unstubAllEnvs());

describe("apiOrigin", () => {
    it("uses the local API in development", () => {
        vi.stubEnv("API_URL", "");
        vi.stubEnv("NODE_ENV", "development");
        expect(apiOrigin()).toBe("http://localhost:8000");
    });

    it("uses Railway in production", () => {
        vi.stubEnv("API_URL", "");
        vi.stubEnv("NODE_ENV", "production");
        expect(apiOrigin()).toBe(
            "https://orion-project-backend-production.up.railway.app",
        );
    });

    it("prefers API_URL without a trailing slash", () => {
        vi.stubEnv("API_URL", " https://api.example.test/ ");
        vi.stubEnv("NODE_ENV", "production");
        expect(apiOrigin()).toBe("https://api.example.test");
    });
});
