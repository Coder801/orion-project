"use client";

import { CheckIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog";
import { TextareaField } from "@/components/ui/FormField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { ReviewDecision, ReviewStatus } from "@/domain/types";
import { useApiErrorMessage } from "@/features/shared/errors";
import { FormError } from "@/features/shared/FormStatus";
import { useAdminUsersQuery } from "@/store/api";

export interface ReviewTarget {
    id: string;
    decision: ReviewDecision;
}

type ReviewMutation = (input: {
    id: string;
    decision: ReviewDecision;
    adminId: string;
    reason?: string;
}) => Promise<{ data: unknown } | { error: unknown }>;

/** Pending-row actions: approve / reject buttons that open the review dialog. */
export function ReviewActions({
    status,
    onReview,
}: {
    status: ReviewStatus;
    onReview: (decision: ReviewDecision) => void;
}) {
    const t = useTranslations("admin.review");
    if (status !== "pending") return null;
    return (
        <div className="flex justify-end gap-1">
            <Button
                size="sm"
                variant="outline"
                onClick={() => onReview("approved")}
            >
                <CheckIcon aria-hidden className="text-success" />
                {t("approve")}
            </Button>
            <Button
                size="sm"
                variant="ghost"
                onClick={() => onReview("rejected")}
            >
                <XIcon aria-hidden className="text-destructive" />
                {t("reject")}
            </Button>
        </div>
    );
}

interface ReviewDialogProps {
    target: ReviewTarget | null;
    adminId: string;
    onClose: () => void;
    review: ReviewMutation;
    isLoading: boolean;
    /** Summary of the item under review. */
    children?: ReactNode;
}

export function ReviewDialog({
    target,
    adminId,
    onClose,
    review,
    isLoading,
    children,
}: ReviewDialogProps) {
    const t = useTranslations("admin.review");
    const tv = useTranslations("validation");
    const tc = useTranslations("common");
    const apiError = useApiErrorMessage();
    const [reason, setReason] = useState("");
    const [reasonError, setReasonError] = useState<string>();
    const [error, setError] = useState<unknown>();

    const close = () => {
        setReason("");
        setReasonError(undefined);
        setError(undefined);
        onClose();
    };

    const confirm = async () => {
        if (!target) return;
        if (target.decision === "rejected" && !reason.trim()) {
            setReasonError(tv("required"));
            return;
        }
        const result = await review({
            ...target,
            adminId,
            reason: reason.trim() || undefined,
        });
        if ("error" in result) setError(result.error);
        else close();
    };

    const isReject = target?.decision === "rejected";
    return (
        <Dialog
            open={target !== null}
            onOpenChange={(open) => {
                if (!open) close();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isReject ? t("rejectTitle") : t("approveTitle")}
                    </DialogTitle>
                    <DialogDescription>
                        {isReject
                            ? t("rejectDescription")
                            : t("approveDescription")}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <FormError message={apiError(error)} />
                    {children}
                    <TextareaField
                        label={isReject ? t("reason") : t("reasonOptional")}
                        rows={3}
                        value={reason}
                        error={reasonError}
                        onChange={(event) => {
                            setReason(event.target.value);
                            setReasonError(undefined);
                        }}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={close}>
                        {t("cancel")}
                    </Button>
                    <SubmitButton
                        type="button"
                        pending={isLoading}
                        pendingLabel={tc("loading")}
                        variant={isReject ? "destructive" : "gradient"}
                        onClick={confirm}
                    >
                        {isReject ? t("reject") : t("approve")}
                    </SubmitButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/** id → email lookup for admin tables. */
export function useUserEmails(adminId: string): Map<string, string> {
    const { data } = useAdminUsersQuery(adminId);
    return useMemo(
        () => new Map((data ?? []).map((u) => [u.id, u.email])),
        [data],
    );
}

/** Key/value summary list used inside review dialogs. */
export function DetailList({ items }: { items: [string, ReactNode][] }) {
    return (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-xl border bg-muted/40 p-4 text-sm">
            {items.map(([label, value]) => (
                <div key={label} className="contents">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="break-all">{value}</dd>
                </div>
            ))}
        </dl>
    );
}
