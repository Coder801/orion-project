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
    phone?: string;
    /** ISO 3166-1 alpha-2 code or "OTHER". */
    country?: string;
    /** Fiat currency used for totals and equivalents; defaults to EUR. */
    displayCurrency?: CurrencyCode;
    /** Cropped square avatar as a data URL. */
    avatar?: string;
    twoFactorEnabled?: boolean;
    /** Card plan id; defaults to the cheapest plan. */
    cardPlan?: string;
}

export interface Session {
    id: string;
    userId: string;
    /** Placeholder device label, e.g. "Browser · Desktop". */
    device: string;
    createdAt: string;
    lastActiveAt: string;
    revokedAt?: string;
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
    | "deposit"
    | "withdrawal"
    | "transfer"
    | "conversion"
    | "card"
    /** Manual balance correction by an admin, outside the request flow. */
    | "adjustment";
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
    /** Payment method or rail of the originating request. */
    method?: string;
    requestId?: string;
    createdAt: string;
}

// ─── Requests reviewed by an admin ──────────────────────────────────────────

export type RequestKind =
    "deposit" | "withdrawal" | "transfer" | "conversion" | "card";
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

export type TransferRail = "sepa" | "wire" | "card";

/** External recipient. Card numbers never reach the app: only a provider token + last 4. */
export interface BeneficiaryDetails {
    name: string;
    iban?: string;
    bic?: string;
    bankAddress?: string;
    bankCountry?: string;
    cardToken?: string;
    cardLast4?: string;
}

export interface Beneficiary extends BeneficiaryDetails {
    id: string;
    userId: string;
    rail: TransferRail;
    createdAt: string;
}

export type TransferTarget =
    | { kind: "own"; accountId: string }
    | { kind: "user"; email: string; userId: string }
    | {
          kind: "external";
          rail: TransferRail;
          beneficiary: BeneficiaryDetails;
          reference?: string;
      };

export interface TransferPayload {
    fromAccountId: string;
    currency: CurrencyCode;
    amount: Minor;
    fee: Minor;
    target: TransferTarget;
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

export type CardProduct =
    | { kind: "plan"; plan: string }
    | { kind: "physicalCard"; deliveryAddress: string };

/** Card plan purchase or physical card order, paid from one account. */
export interface CardPaymentPayload {
    accountId: string;
    currency: CurrencyCode;
    amount: Minor;
    fee: Minor;
    product: CardProduct;
}

export interface RequestPayloadByKind {
    deposit: MoneyMovementPayload;
    withdrawal: MoneyMovementPayload;
    transfer: TransferPayload;
    conversion: ConversionPayload;
    card: CardPaymentPayload;
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
    address: {
        line1: string;
        city: string;
        postalCode: string;
        /** Utility bill or bank statement. */
        proof: StoredFile[];
    };
    document: {
        type: "passport" | "idCard" | "driverLicense";
        number: string;
        /** Front side first, then the back side if the document has one. */
        files: StoredFile[];
    };
    selfie: StoredFile;
    status: ReviewStatus;
    reviewedBy?: string;
    reason?: string;
    createdAt: string;
    reviewedAt?: string;
}

export type CreditPurpose =
    | "business"
    | "realEstate"
    | "vehicle"
    | "education"
    | "medical"
    | "homeRenovation"
    | "debtConsolidation"
    | "travel"
    | "other";

export type EmploymentStatus =
    "employed" | "selfEmployed" | "unemployed" | "retired" | "student";

export interface CreditApplication {
    id: string;
    userId: string;
    amount: Minor;
    currency: CurrencyCode;
    termMonths: number;
    purpose: CreditPurpose;
    employment: EmploymentStatus;
    monthlyIncome: Minor;
    monthlyObligations: Minor;
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
export type ReviewEntity = "request" | "kyc" | "credit";

/** Everything that notifies the user and is audited: reviews and balance adjustments. */
export type AuditedEntity = ReviewEntity | "adjustment";

export type NotificationSubject =
    RequestKind | Exclude<AuditedEntity, "request">;

export interface Notification {
    id: string;
    userId: string;
    entity: AuditedEntity;
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
    entity: AuditedEntity;
    entityId: string;
    /** Set for review status changes. */
    from?: ReviewStatus;
    to?: ReviewStatus;
    /** Signed amount of a balance adjustment. */
    amount?: Minor;
    currency?: CurrencyCode;
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

/** Per-operation amount limits in major units of the currency. */
export interface AmountLimits {
    min: DecimalString;
    max: DecimalString;
}

export type CardSupportLevel = "standard" | "priority" | "dedicated";
export type CardBilling = "free" | "monthly" | "yearly";

export interface CardPlan {
    id: string;
    /** Higher rank = higher plan; downgrades are not allowed. */
    rank: number;
    price: Minor;
    currency: CurrencyCode;
    billing: CardBilling;
    popular?: boolean;
    dailyLimit: Minor;
    atmLimit: Minor;
    support: CardSupportLevel;
    cashbackBps: number;
    /** Keys under `cards.extras.*`. */
    extras: string[];
}

export interface PhysicalCardOffer {
    price: Minor;
    currency: CurrencyCode;
    deliveryDays: { min: number; max: number };
}

export interface CreditSettings {
    currency: CurrencyCode;
    limits: AmountLimits;
    termMonths: { min: number; max: number };
    /** Indicative annual rate for the preliminary payment estimate. */
    aprBps: number;
}

export interface PlatformSettings {
    currencies: Currency[];
    methods: PaymentMethod[];
    /** Price of one unit of each currency in the pivot currency (USD). */
    usdPrices: Record<CurrencyCode, DecimalString>;
    fees: FeeSettings;
    /** Deposit, withdrawal and external transfer limits per currency. */
    limits: Record<CurrencyCode, AmountLimits>;
    cardPlans: CardPlan[];
    physicalCard: PhysicalCardOffer;
    credit: CreditSettings;
}
