import type {
    Account,
    AnyRequest,
    AuditEntry,
    CardOrder,
    CreditApplication,
    KycSubmission,
    Notification,
    PlatformSettings,
    SupportTicket,
    Transaction,
    User,
} from "@/domain/types";

export interface Collection<T extends { id: string }> {
    list(predicate?: (item: T) => boolean): T[];
    get(id: string): T | undefined;
    insert(item: T): T;
    /** Replaces the item with a patched copy; throws if the id is unknown. */
    update(id: string, patch: Partial<T>): T;
}

/**
 * Persistence boundary. The in-memory `MockRepository` implements it today;
 * an API-backed implementation can replace it without touching domain code.
 */
export interface Repository {
    users: Collection<User>;
    accounts: Collection<Account>;
    transactions: Collection<Transaction>;
    requests: Collection<AnyRequest>;
    kyc: Collection<KycSubmission>;
    credits: Collection<CreditApplication>;
    cardOrders: Collection<CardOrder>;
    tickets: Collection<SupportTicket>;
    notifications: Collection<Notification>;
    audit: Collection<AuditEntry>;
    settings: {
        get(): PlatformSettings;
        update(patch: Partial<PlatformSettings>): PlatformSettings;
    };
    /** Runs `work` atomically: if it throws, every change made inside is rolled back. */
    transaction<R>(work: () => R): R;
    nextId(prefix: string): string;
    now(): string;
}
