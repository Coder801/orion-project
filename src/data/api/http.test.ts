import { afterEach, describe, expect, it, vi } from "vitest";
import { apiRequest, ApiRequestError } from "@/data/api/http";

function respond(status: number, body?: unknown) {
    const fetchMock = vi.fn().mockResolvedValue(
        new Response(body === undefined ? null : JSON.stringify(body), {
            status,
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("apiRequest", () => {
    it("calls the same-origin API prefix with a JSON body", async () => {
        const fetchMock = respond(200, { ok: true });
        await expect(
            apiRequest("POST", "/auth/sign-in", { email: "a" }),
        ).resolves.toEqual({ ok: true });
        expect(fetchMock).toHaveBeenCalledWith(
            "/api/v1/auth/sign-in",
            expect.objectContaining({
                method: "POST",
                credentials: "same-origin",
                body: '{"email":"a"}',
            }),
        );
    });

    it("resolves 204 to null", async () => {
        respond(204);
        await expect(apiRequest("POST", "/auth/sign-out")).resolves.toBeNull();
    });

    it("turns the error envelope into an ApiRequestError", async () => {
        respond(422, {
            error: { code: "validation", fields: { email: "email" } },
        });
        await expect(apiRequest("GET", "/x")).rejects.toMatchObject({
            status: 422,
            code: "validation",
            fields: { email: "email" },
        });
    });

    it("reports unknown and network failures", async () => {
        respond(502, "<html>");
        await expect(apiRequest("GET", "/x")).rejects.toMatchObject({
            code: "unknown",
        });
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError()));
        await expect(apiRequest("GET", "/x")).rejects.toBeInstanceOf(
            ApiRequestError,
        );
    });
});
