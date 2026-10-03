import type {
    CurrencyCode,
    KycStatus,
    Minor,
    Role,
    TransactionStatus,
    TransactionType,
} from "@/domain/types";

// Response shapes of orion-bank-api (camelCase JSON, see its /api/docs).

export interface ApiUser {
    id: string;
    email: string;
    name: string;
    role: Role;
    kycStatus: KycStatus;
    createdAt: string;
    phone?: string | null;
    country?: string | null;
    displayCurrency: CurrencyCode;
    twoFactorEnabled: boolean;
    cardPlan: string;
}

export interface ApiMe {
    user: ApiUser;
    sessionId: string;
    permissions: string[];
}

export interface ApiSession {
    id: string;
    userId: string;
    device: string;
    createdAt: string;
    lastActiveAt: string;
    current: boolean;
}

export interface ApiErrorEnvelope {
    error: { code: string; fields?: Record<string, string> | null };
}

export interface ApiAdminUser extends ApiUser {
    status: "active" | "blocked";
    lastLoginAt?: string | null;
}

export interface ApiAccount {
    id: string;
    userId: string;
    currency: CurrencyCode;
    balance: Minor;
    hold: Minor;
}

export interface ApiTransaction {
    id: string;
    userId: string;
    accountId: string;
    type: TransactionType;
    amount: Minor;
    currency: CurrencyCode;
    status: TransactionStatus;
    method?: string | null;
    requestId?: string | null;
    createdAt: string;
}
