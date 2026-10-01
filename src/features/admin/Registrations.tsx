"use client";

import { FileCheckIcon, UsersIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import type { KycSubmission } from "@/domain/types";
import {
    DetailList,
    ReviewActions,
    ReviewDialog,
    useUserEmails,
    type ReviewTarget,
} from "@/features/admin/Review";
import { useCurrentUser } from "@/features/auth/session";
import { AsyncContent } from "@/features/shared/AsyncContent";
import { Panel } from "@/features/shared/Panel";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { formatBytes, formatDate } from "@/lib/format";
import {
    useAdminKycQuery,
    useAdminUsersQuery,
    useReviewKycMutation,
} from "@/store/api";

const VIEWS = ["kyc", "users"] as const;
type View = (typeof VIEWS)[number];

// Both views render inside a flush panel, so their non-table states need padding.
const FLUSH_STATE = "m-5 lg:m-6";

function UsersTable({ adminId }: { adminId: string }) {
    const t = useTranslations("admin.registrations");
    const language = useLocale();
    const {
        data = [],
        isLoading,
        isError,
        refetch,
    } = useAdminUsersQuery(adminId);

    return (
        <AsyncContent
            isLoading={isLoading}
            isError={isError}
            isEmpty={data.length === 0}
            onRetry={refetch}
            loadingLabel={t("users")}
            stateClassName={FLUSH_STATE}
            empty={{ title: t("noUsers"), icon: UsersIcon }}
        >
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-5 lg:pl-6">
                            {t("email")}
                        </TableHead>
                        <TableHead>{t("name")}</TableHead>
                        <TableHead>{t("role")}</TableHead>
                        <TableHead>{t("kycStatus")}</TableHead>
                        <TableHead className="pr-5 lg:pr-6">
                            {t("registered")}
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="pl-5 font-medium lg:pl-6">
                                {user.email}
                            </TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        user.role === "admin"
                                            ? "accent"
                                            : "secondary"
                                    }
                                    className="px-2.5 py-0.5"
                                >
                                    {t(`roles.${user.role}`)}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {user.role === "user" ? (
                                    <StatusBadge status={user.kycStatus} />
                                ) : (
                                    "—"
                                )}
                            </TableCell>
                            <TableCell className="pr-5 text-muted-foreground lg:pr-6">
                                {formatDate(user.createdAt, language)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </AsyncContent>
    );
}

function KycDetails({
    submission,
    email,
}: {
    submission: KycSubmission;
    email: string;
}) {
    const t = useTranslations("admin.registrations");
    const tv = useTranslations("verification");
    const language = useLocale();
    const { personal, address, document } = submission;
    return (
        <DetailList
            items={[
                [t("email"), email],
                [tv("fields.firstName"), personal.firstName],
                [tv("fields.lastName"), personal.lastName],
                [tv("fields.birthDate"), personal.birthDate],
                [
                    tv("fields.country"),
                    tv(`countries.${personal.country as "DE"}`),
                ],
                [
                    tv("fields.line1"),
                    `${address.line1}, ${address.postalCode} ${address.city}`,
                ],
                [
                    tv("fields.documentType"),
                    tv(`documentTypes.${document.type}`),
                ],
                [tv("fields.documentNumber"), document.number],
                [
                    tv("fields.files"),
                    document.files
                        .map(
                            (f) =>
                                `${f.name} (${formatBytes(f.size, language)})`,
                        )
                        .join(", "),
                ],
            ]}
        />
    );
}

function KycQueue({ adminId }: { adminId: string }) {
    const t = useTranslations("admin.registrations");
    const tv = useTranslations("verification");
    const language = useLocale();
    const emails = useUserEmails(adminId);
    const {
        data = [],
        isLoading,
        isError,
        refetch,
    } = useAdminKycQuery(adminId);
    const [review, { isLoading: isReviewing }] = useReviewKycMutation();
    const [target, setTarget] = useState<ReviewTarget | null>(null);
    const selected = data.find((k) => k.id === target?.id);

    return (
        <>
            <AsyncContent
                isLoading={isLoading}
                isError={isError}
                isEmpty={data.length === 0}
                onRetry={refetch}
                loadingLabel={t("kyc")}
                stateClassName={FLUSH_STATE}
                empty={{ title: t("noKyc"), icon: FileCheckIcon }}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="pl-5 lg:pl-6">
                                {t("submitted")}
                            </TableHead>
                            <TableHead>{t("email")}</TableHead>
                            <TableHead>{t("name")}</TableHead>
                            <TableHead>{tv("fields.documentType")}</TableHead>
                            <TableHead>{t("kycStatus")}</TableHead>
                            <TableHead className="pr-5 text-right lg:pr-6">
                                <span className="sr-only">{t("actions")}</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((submission) => (
                            <TableRow key={submission.id}>
                                <TableCell className="pl-5 text-muted-foreground lg:pl-6">
                                    {formatDate(
                                        submission.createdAt,
                                        language,
                                        "dateTime",
                                    )}
                                </TableCell>
                                <TableCell>
                                    {emails.get(submission.userId) ??
                                        submission.userId}
                                </TableCell>
                                <TableCell>
                                    {submission.personal.firstName}{" "}
                                    {submission.personal.lastName}
                                </TableCell>
                                <TableCell>
                                    {tv(
                                        `documentTypes.${submission.document.type}`,
                                    )}
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={submission.status} />
                                    {submission.reason && (
                                        <p className="mt-1 text-xs whitespace-normal text-muted-foreground">
                                            {submission.reason}
                                        </p>
                                    )}
                                </TableCell>
                                <TableCell className="pr-5 lg:pr-6">
                                    <ReviewActions
                                        status={submission.status}
                                        onReview={(decision) =>
                                            setTarget({
                                                id: submission.id,
                                                decision,
                                            })
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </AsyncContent>
            <ReviewDialog
                target={target}
                adminId={adminId}
                onClose={() => setTarget(null)}
                review={review}
                isLoading={isReviewing}
            >
                {selected && (
                    <KycDetails
                        submission={selected}
                        email={emails.get(selected.userId) ?? ""}
                    />
                )}
            </ReviewDialog>
        </>
    );
}

export function Registrations() {
    const t = useTranslations("admin.registrations");
    const admin = useCurrentUser();
    const { data: kyc = [] } = useAdminKycQuery(admin.id);
    const [view, setView] = useState<View>("kyc");
    const pending = kyc.filter((k) => k.status === "pending").length;

    return (
        <Panel
            flush
            toolbar={
                <Tabs
                    value={view}
                    onValueChange={(value) => setView(value as View)}
                >
                    <TabsList aria-label={t("views")}>
                        {VIEWS.map((value) => (
                            <TabsTrigger key={value} value={value}>
                                {t(value)}
                                {value === "kyc" && pending > 0 && (
                                    <span className="rounded-full bg-primary/15 px-1.5 text-xs text-primary tabular-nums">
                                        {pending}
                                    </span>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            }
        >
            {view === "kyc" ? (
                <KycQueue adminId={admin.id} />
            ) : (
                <UsersTable adminId={admin.id} />
            )}
        </Panel>
    );
}
