"use client";

import { FileCheckIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import type { KycSubmission } from "@/domain/types";
import {
    DetailList,
    ReviewActions,
    ReviewDialog,
    UserLink,
    useUserEmails,
    type ReviewTarget,
} from "@/features/admin/Review";
import { useCurrentUser } from "@/features/auth/session";
import { AsyncContent } from "@/features/shared/AsyncContent";
import { Panel } from "@/features/shared/Panel";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { formatBytes, formatDate } from "@/lib/format";
import { useAdminKycQuery, useReviewKycMutation } from "@/store/api";

// The queue renders inside a flush panel, so its non-table states need padding.
const FLUSH_STATE = "m-5 lg:m-6";

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
    const { personal, address, document, selfie } = submission;
    const fileList = (files: { name: string; size: number }[]) =>
        files
            .map((f) => `${f.name} (${formatBytes(f.size, language)})`)
            .join(", ");
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
                [tv("fields.files"), fileList(document.files)],
                [tv("fields.selfie"), fileList([selfie])],
                [tv("fields.proof"), fileList(address.proof)],
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
                                    <UserLink
                                        userId={submission.userId}
                                        emails={emails}
                                    />
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
    const admin = useCurrentUser();
    return (
        <Panel flush>
            <KycQueue adminId={admin.id} />
        </Panel>
    );
}
