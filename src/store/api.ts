import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ReviewInput } from "@/domain/audit";
import { isDomainError, type DomainErrorCode } from "@/domain/errors";
import { MoneyError } from "@/domain/money";
import type { Quote } from "@/domain/rates";
import type {
    Account,
    AnyRequest,
    CardOrder,
    CreditApplication,
    KycSubmission,
    Notification,
    PlatformSettings,
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
        "CardOrder",
        "Ticket",
    ],
    endpoints: (build) => ({
        // ─── Auth ───────────────────────────────────────────────────────────────
        signIn: build.mutation<SessionUser, string>({
            queryFn: (email) => run(() => auth.signIn(email)),
        }),
        signUp: build.mutation<SessionUser, { name: string; email: string }>({
            queryFn: (input) => run(() => auth.signUp(input)),
        }),
        requestPasswordReset: build.mutation<null, string>({
            queryFn: () => run(() => auth.requestPasswordReset()),
        }),

        sendContactMessage: build.mutation<null, ContactValues>({
            queryFn: (input) => run(() => landing.sendContactMessage(input)),
        }),

        // ─── User ───────────────────────────────────────────────────────────────
        me: build.query<User, string>({
            queryFn: (userId) => run(() => user.getMe(userId)),
            providesTags: ["User"],
        }),
        accounts: build.query<Account[], string>({
            queryFn: (userId) => run(() => user.listAccounts(userId)),
            providesTags: ["Account"],
        }),
        transactions: build.query<
            Transaction[],
            { userId: string; limit?: number }
        >({
            queryFn: ({ userId, limit }) =>
                run(() => user.listTransactions(userId, limit)),
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
        updateProfile: build.mutation<User, UserArg<{ name: string }>>({
            queryFn: ({ userId, input }) =>
                run(() => user.updateProfile(userId, input)),
            invalidatesTags: ["User"],
        }),
        changePassword: build.mutation<null, void>({
            queryFn: () => run(() => user.changePassword()),
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
        createDeposit: build.mutation<AnyRequest, payments.MovementInput>({
            queryFn: (input) => run(() => payments.createDeposit(input)),
            invalidatesTags: ["Request", "Transaction", "Account"],
        }),
        createWithdrawal: build.mutation<AnyRequest, payments.MovementInput>({
            queryFn: (input) => run(() => payments.createWithdrawal(input)),
            invalidatesTags: ["Request", "Transaction", "Account"],
        }),
        createTransfer: build.mutation<AnyRequest, payments.TransferInput>({
            queryFn: (input) => run(() => payments.createTransfer(input)),
            invalidatesTags: ["Request", "Transaction", "Account"],
        }),
        quote: build.query<Quote, Omit<payments.ConvertInput, "userId">>({
            queryFn: (input) => run(() => payments.getQuote(input)),
            providesTags: ["Settings"],
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
        cardOrders: build.query<CardOrder[], string>({
            queryFn: (userId) => run(() => products.listCardOrders(userId)),
            providesTags: ["CardOrder"],
        }),
        orderCard: build.mutation<CardOrder, UserArg<products.CardOrderInput>>({
            queryFn: ({ userId, input }) =>
                run(() => products.orderCard(userId, input)),
            invalidatesTags: ["CardOrder"],
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
            queryFn: (adminId) => run(() => admin.listUsers(adminId)),
            providesTags: ["User"],
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
        adminCardOrders: build.query<CardOrder[], string>({
            queryFn: (adminId) => run(() => admin.listAllCardOrders(adminId)),
            providesTags: ["CardOrder"],
        }),
        reviewRequest: build.mutation<AnyRequest, ReviewInput>({
            queryFn: (input) => run(() => admin.reviewRequestAsAdmin(input)),
            invalidatesTags: [
                "Request",
                "Account",
                "Transaction",
                "Notification",
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
        reviewCardOrder: build.mutation<CardOrder, ReviewInput>({
            queryFn: (input) => run(() => admin.reviewCardOrderAsAdmin(input)),
            invalidatesTags: ["CardOrder", "Notification"],
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
                "CardOrder",
                "Ticket",
            ],
        }),
    }),
});

export const {
    useSignInMutation,
    useSignUpMutation,
    useRequestPasswordResetMutation,
    useSendContactMessageMutation,
    useMeQuery,
    useAccountsQuery,
    useTransactionsQuery,
    useNotificationsQuery,
    useMarkNotificationsReadMutation,
    useUpdateProfileMutation,
    useChangePasswordMutation,
    usePlatformSettingsQuery,
    useUserRequestsQuery,
    useCreateDepositMutation,
    useCreateWithdrawalMutation,
    useCreateTransferMutation,
    useQuoteQuery,
    useCreateConversionMutation,
    useKycQuery,
    useSubmitKycMutation,
    useCreditsQuery,
    useApplyForCreditMutation,
    useCardOrdersQuery,
    useOrderCardMutation,
    useTicketsQuery,
    useCreateTicketMutation,
    useAdminUsersQuery,
    useAdminKycQuery,
    useAdminRequestsQuery,
    useAdminCreditsQuery,
    useAdminCardOrdersQuery,
    useReviewRequestMutation,
    useReviewKycMutation,
    useReviewCreditMutation,
    useReviewCardOrderMutation,
    useUpdatePlatformSettingsMutation,
    useResetDemoMutation,
} = api;
