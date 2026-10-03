import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ReviewInput } from "@/domain/audit";
import { ApiRequestError } from "@/data/api/http";
import {
    isDomainError,
    isDomainErrorCode,
    type DomainErrorCode,
} from "@/domain/errors";
import { MoneyError } from "@/domain/money";
import type { LockedQuote, RatesSnapshot } from "@/domain/rates";
import type {
    Account,
    AnyRequest,
    Beneficiary,
    CreditApplication,
    CurrencyCode,
    KycSubmission,
    Notification,
    PlatformSettings,
    Session,
    SupportTicket,
    Transaction,
    User,
} from "@/domain/types";
import * as admin from "@/features/admin/service";
import * as auth from "@/features/auth/service";
import type { ContactValues } from "@/features/landing/contact-schema";
import * as landing from "@/features/landing/service";
import * as payments from "@/features/payments/service";
import { getPlatformSettings } from "@/features/platform/service";
import * as products from "@/features/products/service";
import * as user from "@/features/user/service";
import * as verification from "@/features/verification/service";
import type { SessionUser } from "@/types";

export interface ApiError {
    code: DomainErrorCode | "unknown";
}

async function run<T>(
    work: () => Promise<T>,
): Promise<{ data: T } | { error: ApiError }> {
    try {
        return { data: await work() };
    } catch (error) {
        if (isDomainError(error)) return { error: { code: error.code } };
        if (error instanceof ApiRequestError)
            return {
                error: {
                    code: isDomainErrorCode(error.code)
                        ? error.code
                        : "unknown",
                },
            };
        if (error instanceof MoneyError)
            return { error: { code: "invalidAmount" } };
        console.error(error);
        return { error: { code: "unknown" } };
    }
}

interface UserArg<T> {
    userId: string;
    input: T;
}

// Mutations with no payload resolve to `null`: RTK Query rejects `{ data: undefined }`.
// The mock backend runs in the browser, so endpoints call services directly.
// Tags are coarse on purpose: an admin review touches accounts, transactions,
// requests and notifications at once.
export const api = createApi({
    reducerPath: "api",
    baseQuery: fakeBaseQuery<ApiError>(),
    tagTypes: [
        "User",
        "Account",
        "Transaction",
        "Notification",
        "Request",
        "Settings",
        "Kyc",
        "Credit",
        "Ticket",
        "Session",
        "Beneficiary",
        "Rates",
    ],
    endpoints: (build) => ({
        // ─── Auth ───────────────────────────────────────────────────────────────
        signIn: build.mutation<SessionUser, auth.SignInInput>({
            queryFn: (input) => run(() => auth.signIn(input)),
        }),
        signUp: build.mutation<SessionUser, auth.SignUpInput>({
            queryFn: (input) => run(() => auth.signUp(input)),
        }),
        requestPasswordReset: build.mutation<null, string>({
            queryFn: (email) => run(() => auth.requestPasswordReset(email)),
        }),
        signOut: build.mutation<null, void>({
            queryFn: () => run(() => auth.signOut()),
        }),

        sendContactMessage: build.mutation<null, ContactValues>({
            queryFn: (input) => run(() => landing.sendContactMessage(input)),
        }),

        // ─── User ───────────────────────────────────────────────────────────────
        // Profile and sessions come from orion-bank-api; the session cookie
        // identifies the user, the id argument only scopes the cache.
        me: build.query<User, string>({
            queryFn: () => run(() => user.getMe()),
            providesTags: ["User"],
        }),
        accounts: build.query<Account[], string>({
            queryFn: () => run(() => user.listAccounts()),
            providesTags: ["Account"],
        }),
        transactions: build.query<
            Transaction[],
            { userId: string; limit?: number }
        >({
            queryFn: ({ limit }) => run(() => user.listTransactions(limit)),
            providesTags: ["Transaction"],
        }),
        notifications: build.query<Notification[], string>({
            queryFn: (userId) => run(() => user.listNotifications(userId)),
            providesTags: ["Notification"],
        }),
        markNotificationsRead: build.mutation<null, string>({
            queryFn: (userId) => run(() => user.markNotificationsRead(userId)),
            invalidatesTags: ["Notification"],
        }),
        setDisplayCurrency: build.mutation<User, UserArg<CurrencyCode>>({
            queryFn: ({ input }) => run(() => user.setDisplayCurrency(input)),
            invalidatesTags: ["User"],
        }),
        setAvatar: build.mutation<User, UserArg<string | null>>({
            queryFn: ({ userId, input }) =>
                run(() => user.setAvatar(userId, input)),
            invalidatesTags: ["User"],
        }),
        setTwoFactor: build.mutation<
            User,
            UserArg<{ enabled: boolean; code: string }>
        >({
            queryFn: ({ input }) => run(() => user.setTwoFactor(input)),
            invalidatesTags: ["User"],
        }),
        sessions: build.query<Session[], string>({
            queryFn: () => run(() => user.listSessions()),
            providesTags: ["Session"],
        }),
        revokeSession: build.mutation<null, UserArg<string>>({
            queryFn: ({ input }) => run(() => user.revokeSession(input)),
            invalidatesTags: ["Session"],
        }),
        changePassword: build.mutation<
            null,
            { currentPassword: string; newPassword: string }
        >({
            queryFn: (input) => run(() => user.changePassword(input)),
            invalidatesTags: ["Session"],
        }),
        platformSettings: build.query<PlatformSettings, void>({
            queryFn: () => run(() => getPlatformSettings()),
            providesTags: ["Settings"],
        }),

        // ─── Money movement ─────────────────────────────────────────────────────
        userRequests: build.query<AnyRequest[], string>({
            queryFn: (userId) => run(() => payments.listUserRequests(userId)),
            providesTags: ["Request"],
        }),
        depositInstructions: build.query<
            payments.DepositInstructions,
            payments.DepositInstructionsInput
        >({
            queryFn: (input) =>
                run(() => payments.getDepositInstructions(input)),
        }),
        createDeposit: build.mutation<AnyRequest, payments.DepositInput>({
            queryFn: (input) => run(() => payments.createDeposit(input)),
            invalidatesTags: ["Request", "Transaction", "Account"],
        }),
        createWithdrawal: build.mutation<AnyRequest, payments.WithdrawalInput>({
            queryFn: (input) => run(() => payments.createWithdrawal(input)),
            invalidatesTags: ["Request", "Transaction", "Account"],
        }),
        createTransfer: build.mutation<AnyRequest, payments.TransferInput>({
            queryFn: (input) => run(() => payments.createTransfer(input)),
            invalidatesTags: [
                "Request",
                "Transaction",
                "Account",
                "Beneficiary",
            ],
        }),
        beneficiaries: build.query<Beneficiary[], string>({
            queryFn: (userId) => run(() => payments.listBeneficiaries(userId)),
            providesTags: ["Beneficiary"],
        }),
        // Indicative prices, cached for a minute (pages that need a live feed poll).
        rates: build.query<RatesSnapshot, void>({
            queryFn: () => run(() => payments.getRates()),
            providesTags: ["Rates", "Settings"],
            keepUnusedDataFor: 60,
        }),
        lockQuote: build.mutation<LockedQuote, payments.QuoteInput>({
            queryFn: (input) => run(() => payments.lockQuote(input)),
        }),
        createConversion: build.mutation<AnyRequest, payments.ConvertInput>({
            queryFn: (input) => run(() => payments.createConversion(input)),
            invalidatesTags: ["Request", "Transaction", "Account"],
        }),

        // ─── Verification & products ────────────────────────────────────────────
        kyc: build.query<KycSubmission | null, string>({
            queryFn: (userId) => run(() => verification.getLatestKyc(userId)),
            providesTags: ["Kyc"],
        }),
        submitKyc: build.mutation<
            KycSubmission,
            UserArg<verification.KycInput>
        >({
            queryFn: ({ userId, input }) =>
                run(() => verification.submitKyc(userId, input)),
            invalidatesTags: ["Kyc", "User"],
        }),
        credits: build.query<CreditApplication[], string>({
            queryFn: (userId) => run(() => products.listCredits(userId)),
            providesTags: ["Credit"],
        }),
        applyForCredit: build.mutation<
            CreditApplication,
            UserArg<products.CreditInput>
        >({
            queryFn: ({ userId, input }) =>
                run(() => products.applyForCredit(userId, input)),
            invalidatesTags: ["Credit"],
        }),
        selectCardPlan: build.mutation<
            AnyRequest,
            UserArg<products.CardPlanInput>
        >({
            queryFn: ({ userId, input }) =>
                run(() => products.selectCardPlan(userId, input)),
            invalidatesTags: ["Request", "Transaction", "Account"],
        }),
        orderPhysicalCard: build.mutation<
            AnyRequest,
            UserArg<products.PhysicalCardInput>
        >({
            queryFn: ({ userId, input }) =>
                run(() => products.orderPhysicalCard(userId, input)),
            invalidatesTags: ["Request", "Transaction", "Account"],
        }),
        tickets: build.query<SupportTicket[], string>({
            queryFn: (userId) => run(() => products.listTickets(userId)),
            providesTags: ["Ticket"],
        }),
        createTicket: build.mutation<
            SupportTicket,
            UserArg<products.TicketInput>
        >({
            queryFn: ({ userId, input }) =>
                run(() => products.createTicket(userId, input)),
            invalidatesTags: ["Ticket"],
        }),

        // ─── Admin ──────────────────────────────────────────────────────────────
        adminUsers: build.query<User[], string>({
            queryFn: () => run(() => admin.listUsers()),
            providesTags: ["User"],
        }),
        adminUser: build.query<User, admin.UserScope>({
            queryFn: (scope) => run(() => admin.getUser(scope)),
            providesTags: ["User"],
        }),
        adminUserAccounts: build.query<Account[], admin.UserScope>({
            queryFn: (scope) => run(() => admin.listUserAccounts(scope)),
            providesTags: ["Account"],
        }),
        adminUserTransactions: build.query<Transaction[], admin.UserScope>({
            queryFn: (scope) => run(() => admin.listUserTransactions(scope)),
            providesTags: ["Transaction"],
        }),
        adjustBalance: build.mutation<Transaction, admin.AdjustmentInput>({
            queryFn: (input) => run(() => admin.adjustUserBalance(input)),
            invalidatesTags: ["Account", "Transaction", "Notification"],
        }),
        adminKyc: build.query<KycSubmission[], string>({
            queryFn: (adminId) => run(() => admin.listKycSubmissions(adminId)),
            providesTags: ["Kyc"],
        }),
        adminRequests: build.query<AnyRequest[], string>({
            queryFn: (adminId) => run(() => admin.listRequests(adminId)),
            providesTags: ["Request"],
        }),
        adminCredits: build.query<CreditApplication[], string>({
            queryFn: (adminId) =>
                run(() => admin.listCreditApplications(adminId)),
            providesTags: ["Credit"],
        }),
        reviewRequest: build.mutation<AnyRequest, ReviewInput>({
            queryFn: (input) => run(() => admin.reviewRequestAsAdmin(input)),
            invalidatesTags: [
                "Request",
                "Account",
                "Transaction",
                "Notification",
                "User",
            ],
        }),
        reviewKyc: build.mutation<KycSubmission, ReviewInput>({
            queryFn: (input) => run(() => admin.reviewKycAsAdmin(input)),
            invalidatesTags: ["Kyc", "User", "Notification"],
        }),
        reviewCredit: build.mutation<CreditApplication, ReviewInput>({
            queryFn: (input) => run(() => admin.reviewCreditAsAdmin(input)),
            invalidatesTags: ["Credit", "Notification"],
        }),
        updatePlatformSettings: build.mutation<
            PlatformSettings,
            { adminId: string; patch: Partial<PlatformSettings> }
        >({
            queryFn: ({ adminId, patch }) =>
                run(() => admin.updatePlatformSettings(adminId, patch)),
            invalidatesTags: ["Settings"],
        }),
        resetDemo: build.mutation<null, string>({
            queryFn: (adminId) => run(() => admin.resetDemo(adminId)),
            invalidatesTags: [
                "User",
                "Account",
                "Transaction",
                "Notification",
                "Request",
                "Settings",
                "Kyc",
                "Credit",
                "Ticket",
                "Session",
                "Beneficiary",
                "Rates",
            ],
        }),
    }),
});

export const {
    useSignInMutation,
    useSignUpMutation,
    useRequestPasswordResetMutation,
    useSignOutMutation,
    useSendContactMessageMutation,
    useMeQuery,
    useAccountsQuery,
    useTransactionsQuery,
    useNotificationsQuery,
    useMarkNotificationsReadMutation,
    useSetDisplayCurrencyMutation,
    useSetAvatarMutation,
    useSetTwoFactorMutation,
    useSessionsQuery,
    useRevokeSessionMutation,
    useChangePasswordMutation,
    usePlatformSettingsQuery,
    useUserRequestsQuery,
    useCreateDepositMutation,
    useCreateWithdrawalMutation,
    useDepositInstructionsQuery,
    useCreateTransferMutation,
    useBeneficiariesQuery,
    useRatesQuery,
    useLockQuoteMutation,
    useCreateConversionMutation,
    useKycQuery,
    useSubmitKycMutation,
    useCreditsQuery,
    useApplyForCreditMutation,
    useSelectCardPlanMutation,
    useOrderPhysicalCardMutation,
    useTicketsQuery,
    useCreateTicketMutation,
    useAdminUsersQuery,
    useAdminUserQuery,
    useAdminUserAccountsQuery,
    useAdminUserTransactionsQuery,
    useAdjustBalanceMutation,
    useAdminKycQuery,
    useAdminRequestsQuery,
    useAdminCreditsQuery,
    useReviewRequestMutation,
    useReviewKycMutation,
    useReviewCreditMutation,
    useUpdatePlatformSettingsMutation,
    useResetDemoMutation,
} = api;
