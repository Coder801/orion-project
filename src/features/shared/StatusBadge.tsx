import type { VariantProps } from "class-variance-authority";
import { useTranslations } from "next-intl";

import { Badge, badgeVariants } from "@/components/ui/Badge";
import type {
    KycStatus,
    ReviewStatus,
    TicketStatus,
    TransactionStatus,
} from "@/domain/types";

export type AnyStatus =
    ReviewStatus | TransactionStatus | KycStatus | TicketStatus;

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

const VARIANT: Record<AnyStatus, BadgeVariant> = {
    pending: "warning",
    approved: "success",
    completed: "success",
    rejected: "destructive",
    failed: "destructive",
    none: "secondary",
    open: "glow",
    answered: "success",
    closed: "secondary",
};

export function StatusBadge({
    status,
    label,
}: {
    status: AnyStatus;
    /** Domain-specific wording for the status (colour still follows `status`). */
    label?: string;
}) {
    const t = useTranslations("status");
    return (
        <Badge variant={VARIANT[status]} className="px-2.5 py-0.5">
            <span aria-hidden className="size-1.5 rounded-full bg-current" />
            {label ?? t(status)}
        </Badge>
    );
}
