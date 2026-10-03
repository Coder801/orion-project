import { API_PREFIX } from "@/data/api/origin";
import type { ApiErrorEnvelope } from "@/data/api/types";

/** A non-2xx answer of the API, carrying its error envelope. */
export class ApiRequestError extends Error {
    constructor(
        readonly status: number,
        readonly code: string,
        readonly fields?: Record<string, string>,
    ) {
        super(code);
        this.name = "ApiRequestError";
    }
}

function isEnvelope(value: unknown): value is ApiErrorEnvelope {
    return (
        typeof value === "object" &&
        value !== null &&
        "error" in value &&
        typeof (value as ApiErrorEnvelope).error?.code === "string"
    );
}

async function parseError(response: Response): Promise<ApiRequestError> {
    let body: unknown = null;
    try {
        body = await response.json();
    } catch {
        // Not JSON (proxy error page, API down).
    }
    if (isEnvelope(body))
        return new ApiRequestError(
            response.status,
            body.error.code,
            body.error.fields ?? undefined,
        );
    return new ApiRequestError(response.status, "unknown");
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Browser call to orion-bank-api on the same origin (`/api/v1`). The session
 * is the httpOnly `orion_sid` cookie; 204 resolves to null.
 */
export async function apiRequest<T>(
    method: Method,
    path: string,
    body?: unknown,
): Promise<T> {
    let response: Response;
    try {
        response = await fetch(`${API_PREFIX}${path}`, {
            method,
            credentials: "same-origin",
            headers:
                body === undefined
                    ? undefined
                    : { "Content-Type": "application/json" },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch {
        throw new ApiRequestError(0, "network");
    }
    if (!response.ok) throw await parseError(response);
    if (response.status === 204) return null as T;
    return (await response.json()) as T;
}
