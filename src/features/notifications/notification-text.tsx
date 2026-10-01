"use client";

import { useLocale, useTranslations } from "next-intl";

import type { Notification } from "@/domain/types";
import { formatDate } from "@/lib/format";

/** Message, optional rejection reason and timestamp of a review notification. */
export function NotificationText({
    notification,
}: {
    notification: Notification;
}) {
    const t = useTranslations();
    const language = useLocale();

    return (
        <>
            <span className="block text-sm text-foreground">
                {t("notifications.message", {
                    subject: t(
                        `notifications.subjects.${notification.subject}`,
                    ),
                    status: t(`status.${notification.status}`),
                })}
            </span>
            {notification.reason && (
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                    {t("notifications.reason", { reason: notification.reason })}
                </span>
            )}
            <span className="mt-1 block text-[10px] text-muted-foreground/70">
                {formatDate(notification.createdAt, language, "dateTime")}
            </span>
        </>
    );
}
