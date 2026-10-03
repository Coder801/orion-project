export const DOMAIN_ERROR_CODES = [
    "notFound",
    "forbidden",
    "invalidCredentials",
    "emailTaken",
    "kycRequired",
    "kycAlreadySubmitted",
    "insufficientFunds",
    "invalidAmount",
    "currencyDisabled",
    "methodUnavailable",
    "currencyMismatch",
    "sameAccount",
    "sameCurrency",
    "recipientNotFound",
    "recipientSelf",
    "reasonRequired",
    "amountOutOfRange",
    "invalidCode",
    "invalidDetails",
    "quoteExpired",
    "planUnavailable",
    "requestPending",
    "invariant",
    // Reported by orion-bank-api (or the transport) only.
    "unauthorized",
    "accountBlocked",
    "rateLimited",
    "invalidPassword",
    "validation",
    "network",
    // Requests can't move mock balances while accounts live in the API.
    "moneyMovementPaused",
] as const;

export type DomainErrorCode = (typeof DOMAIN_ERROR_CODES)[number];

export function isDomainErrorCode(value: string): value is DomainErrorCode {
    return (DOMAIN_ERROR_CODES as readonly string[]).includes(value);
}

/** Business-rule violation; `code` maps to the `domainErrors.<code>` i18n key. */
export class DomainError extends Error {
    constructor(
        readonly code: DomainErrorCode,
        message: string = code,
    ) {
        super(message);
        this.name = "DomainError";
    }
}

export function isDomainError(error: unknown): error is DomainError {
    return error instanceof DomainError;
}
