export type DomainErrorCode =
    | "notFound"
    | "forbidden"
    | "invalidCredentials"
    | "emailTaken"
    | "kycRequired"
    | "kycAlreadySubmitted"
    | "insufficientFunds"
    | "invalidAmount"
    | "currencyDisabled"
    | "methodUnavailable"
    | "currencyMismatch"
    | "sameAccount"
    | "sameCurrency"
    | "recipientNotFound"
    | "recipientSelf"
    | "reasonRequired"
    | "amountOutOfRange"
    | "invalidCode"
    | "invalidDetails"
    | "quoteExpired"
    | "planUnavailable"
    | "requestPending"
    | "invariant";

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
