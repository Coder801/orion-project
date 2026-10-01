/**
 * Integer amount in minor units (cents, satoshi, …) serialized as a string so it
 * survives Redux, JSON and localStorage. Do arithmetic only via `domain/money`.
 */
export type Minor = string;

/** Decimal number serialized as a string, e.g. a rate "1.0842". */
export type DecimalString = string;

export type CurrencyCode = string;
export type CurrencyType = "fiat" | "crypto";

export type Role = "user" | "admin";
export type KycStatus = "none" | "pending" | "approved" | "rejected";

export interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    kycStatus: KycStatus;
    createdAt: string;
}

export interface Currency {
    code: CurrencyCode;
    type: CurrencyType;
    decimals: number;
    enabled: boolean;
}

export interface Account {
    id: string;
    userId: string;
    currency: CurrencyCode;
    balance: Minor;
    /** Funds reserved by pending debit requests; available = balance - hold. */
    hold: Minor;
}

export type TransactionType =
    "deposit" | "withdrawal" | "transfer" | "conversion";
export type TransactionStatus = "pending" | "completed" | "failed";

export interface Transaction {
    id: string;
    userId: string;
    accountId: string;
    type: TransactionType;
    /** Signed: negative for debits. */
    amount: Minor;
    currency: CurrencyCode;
    status: TransactionStatus;
    requestId?: string;
    createdAt: string;
}

// ─── Requests reviewed by an admin ──────────────────────────────────────────

export type RequestKind = "deposit" | "withdrawal" | "transfer" | "conversion";
export type ReviewStatus = "pending" | "approved" | "rejected";
export type ReviewDecision = "approved" | "rejected";

export interface MoneyMovementPayload {
    accountId: string;
    currency: CurrencyCode;
    amount: Minor;
    fee: Minor;
    /** Values of the method's dynamic fields (IBAN, address, …). */
    fields: Record<string, string>;
}

export interface TransferPayload {
    fromAccountId: string;
    currency: CurrencyCode;
    amount: Minor;
    fee: Minor;
    target:
        | { kind: "own"; accountId: string }
        | { kind: "user"; email: string; userId: string };
}

export interface ConversionPayload {
    fromAccountId: string;
    from: CurrencyCode;
    to: CurrencyCode;
    /** Debited from the source account (fee included separately). */
    amount: Minor;
    fee: Minor;
    rate: DecimalString;
    /** Credited to the target account on approval. */
    toAmount: Minor;
}

export interface RequestPayloadByKind {
    deposit: MoneyMovementPayload;
    withdrawal: MoneyMovementPayload;
    transfer: TransferPayload;
    conversion: ConversionPayload;
}

export interface Request<T = unknown> {
    id: string;
    userId: string;
    kind: RequestKind;
    method: string;
    payload: T;
    status: ReviewStatus;
    reviewedBy?: string;
    reason?: string;
    createdAt: string;
    reviewedAt?: string;
}

export type AnyRequest = {
    [K in RequestKind]: Request<RequestPayloadByKind[K]> & { kind: K };
}[RequestKind];

// ─── Other reviewable entities ──────────────────────────────────────────────

export interface StoredFile {
    id: string;
    name: string;
    size: number;
    mimeType: string;
}

export interface KycSubmission {
    id: string;
    userId: string;
    personal: {
        firstName: string;
        lastName: string;
        birthDate: string;
        country: string;
    };
    address: { line1: string; city: string; postalCode: string };
    document: {
        type: "passport" | "idCard" | "driverLicense";
        number: string;
        files: StoredFile[];
    };
    status: ReviewStatus;
    reviewedBy?: string;
    reason?: string;
    createdAt: string;
    reviewedAt?: string;
}

export interface CreditApplication {
    id: string;
    userId: string;
    amount: Minor;
    currency: CurrencyCode;
    termMonths: number;
    purpose: "personal" | "education" | "business" | "other";
    monthlyIncome: Minor;
    status: ReviewStatus;
    reviewedBy?: string;
    reason?: string;
    createdAt: string;
    reviewedAt?: string;
}

export type CardType = "virtual" | "physical";
export type CardTier = "standard" | "premium";

export interface CardOrder {
    id: string;
    userId: string;
    type: CardType;
    tier: CardTier;
    accountId: string;
    deliveryAddress?: string;
    status: ReviewStatus;
    reviewedBy?: string;
    reason?: string;
    createdAt: string;
    reviewedAt?: string;
}

export type TicketStatus = "open" | "answered" | "closed";
export type TicketCategory = "account" | "payments" | "verification" | "other";

export interface SupportTicket {
    id: string;
    userId: string;
    subject: string;
    category: TicketCategory;
    message: string;
    status: TicketStatus;
    createdAt: string;
}

/** Entities whose status changes are reported to the user and audited. */
export type ReviewEntity = "request" | "kyc" | "credit" | "cardOrder";

export type NotificationSubject =
    RequestKind | Exclude<ReviewEntity, "request">;

export interface Notification {
    id: string;
    userId: string;
    entity: ReviewEntity;
    entityId: string;
    /** What the message is about, e.g. the request kind. */
    subject: NotificationSubject;
    status: ReviewStatus;
    reason?: string;
    read: boolean;
    createdAt: string;
}

export interface AuditEntry {
    id: string;
    actorId: string;
    entity: ReviewEntity;
    entityId: string;
    from: ReviewStatus;
    to: ReviewStatus;
    reason?: string;
    createdAt: string;
}

// ─── Platform configuration (editable by admins) ────────────────────────────

export type MethodKind = "deposit" | "withdrawal";

export type FieldKind =
    | "text"
    | "holderName"
    | "iban"
    | "bic"
    | "accountNumber"
    | "routingNumber"
    | "cardNumber"
    | "cardExpiry"
    | "cryptoAddress"
    | "network"
    | "txHash";

export interface FieldSchema {
    name: string;
    kind: FieldKind;
    optional?: boolean;
}

export interface PaymentMethod {
    id: string;
    kind: MethodKind;
    currencies: CurrencyCode[];
    fields: FieldSchema[];
    enabled: boolean;
}

export interface FeeSettings {
    /** Basis points of the amount (100 bps = 1%). */
    conversionBps: number;
    withdrawalBps: number;
    transferBps: number;
}

export interface PlatformSettings {
    currencies: Currency[];
    methods: PaymentMethod[];
    /** Price of one unit of each currency in the pivot currency (USD). */
    usdPrices: Record<CurrencyCode, DecimalString>;
    fees: FeeSettings;
}
