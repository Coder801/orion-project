import type { Collection, Repository } from "@/data/repository";
import type {
    Account,
    AnyRequest,
    AuditEntry,
    Beneficiary,
    CreditApplication,
    KycSubmission,
    Notification,
    PlatformSettings,
    Session,
    SupportTicket,
    Transaction,
    User,
} from "@/domain/types";

export interface DbState {
    version: number;
    seq: number;
    users: User[];
    accounts: Account[];
    transactions: Transaction[];
    requests: AnyRequest[];
    kyc: KycSubmission[];
    credits: CreditApplication[];
    beneficiaries: Beneficiary[];
    sessions: Session[];
    tickets: SupportTicket[];
    notifications: Notification[];
    audit: AuditEntry[];
    settings: PlatformSettings;
}

type CollectionKey = {
    [K in keyof DbState]: DbState[K] extends { id: string }[] ? K : never;
}[keyof DbState];

interface MockRepositoryOptions {
    /** Called with the new state after every committed change. */
    onCommit?: (state: DbState) => void;
    clock?: () => Date;
}

export class MockRepository implements Repository {
    private state: DbState;
    private depth = 0;
    private readonly onCommit?: (state: DbState) => void;
    private readonly clock: () => Date;

    readonly users: Collection<User>;
    readonly accounts: Collection<Account>;
    readonly transactions: Collection<Transaction>;
    readonly requests: Collection<AnyRequest>;
    readonly kyc: Collection<KycSubmission>;
    readonly credits: Collection<CreditApplication>;
    readonly beneficiaries: Collection<Beneficiary>;
    readonly sessions: Collection<Session>;
    readonly tickets: Collection<SupportTicket>;
    readonly notifications: Collection<Notification>;
    readonly audit: Collection<AuditEntry>;

    constructor(
        initial: DbState,
        { onCommit, clock = () => new Date() }: MockRepositoryOptions = {},
    ) {
        this.state = structuredClone(initial);
        this.onCommit = onCommit;
        this.clock = clock;
        this.users = this.collection("users");
        this.accounts = this.collection("accounts");
        this.transactions = this.collection("transactions");
        this.requests = this.collection("requests");
        this.kyc = this.collection("kyc");
        this.credits = this.collection("credits");
        this.beneficiaries = this.collection("beneficiaries");
        this.sessions = this.collection("sessions");
        this.tickets = this.collection("tickets");
        this.notifications = this.collection("notifications");
        this.audit = this.collection("audit");
    }

    readonly settings = {
        get: (): PlatformSettings => this.state.settings,
        update: (patch: Partial<PlatformSettings>): PlatformSettings => {
            this.state.settings = { ...this.state.settings, ...patch };
            this.commit();
            return this.state.settings;
        },
    };

    transaction<R>(work: () => R): R {
        const snapshot = this.depth === 0 ? structuredClone(this.state) : null;
        this.depth += 1;
        try {
            const result = work();
            this.depth -= 1;
            this.commit();
            return result;
        } catch (error) {
            this.depth -= 1;
            if (snapshot) this.state = snapshot;
            throw error;
        }
    }

    nextId(prefix: string): string {
        this.state.seq += 1;
        return `${prefix}_${this.state.seq.toString(36).padStart(4, "0")}`;
    }

    now(): string {
        return this.clock().toISOString();
    }

    snapshot(): DbState {
        return structuredClone(this.state);
    }

    private commit(): void {
        if (this.depth === 0) this.onCommit?.(this.state);
    }

    // Items are replaced, never mutated in place, so objects handed out earlier
    // (e.g. cached by RTK Query) stay frozen in time.
    private collection<K extends CollectionKey>(
        key: K,
    ): Collection<DbState[K][number]> {
        type Item = DbState[K][number];
        const items = () => this.state[key] as Item[];
        const setItems = (next: Item[]) => {
            (this.state[key] as Item[]) = next;
        };

        return {
            list: (predicate) =>
                predicate ? items().filter(predicate) : [...items()],
            get: (id) => items().find((item) => item.id === id),
            insert: (item) => {
                setItems([...items(), item]);
                this.commit();
                return item;
            },
            update: (id, patch) => {
                const current = items().find((item) => item.id === id);
                if (!current) throw new Error(`${key}/${id} not found`);
                const next = { ...current, ...patch } as Item;
                setItems(items().map((item) => (item.id === id ? next : item)));
                this.commit();
                return next;
            },
        };
    }
}
