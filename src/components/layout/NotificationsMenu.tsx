"use client";

import { useTranslations } from "next-intl";
import { BellIcon, CheckCheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useCurrentUser } from "@/features/auth/session";
import { NotificationText } from "@/features/notifications/NotificationText";
import {
    useMarkNotificationsReadMutation,
    useNotificationsQuery,
} from "@/store/api";
import { cn } from "@/lib/utils";

const MENU_LIMIT = 5;

export function NotificationsMenu() {
    const t = useTranslations();
    const user = useCurrentUser();
    const { data = [] } = useNotificationsQuery(user.id);
    const [markRead] = useMarkNotificationsReadMutation();
    const unread = data.filter((n) => !n.read).length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("layout.notificationsLabel", {
                        count: unread,
                    })}
                    className="relative"
                >
                    <BellIcon className="size-4.5" />
                    {unread > 0 && (
                        <span
                            aria-hidden
                            className="absolute top-2 right-2.5 size-2 rounded-full bg-primary shadow-[0_0_8px_var(--glow-primary)]"
                        />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span className="text-sm text-foreground">
                        {t("dashboard.notifications")}
                    </span>
                    {unread > 0 && (
                        <Badge variant="glow" className="px-2 py-0 text-[10px]">
                            {t("layout.unread", { count: unread })}
                        </Badge>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {data.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                        {t("dashboard.noNotifications")}
                    </p>
                ) : (
                    data.slice(0, MENU_LIMIT).map((n) => (
                        <DropdownMenuItem
                            key={n.id}
                            className="items-start gap-3 py-2.5"
                        >
                            <span
                                aria-hidden
                                className={cn(
                                    "mt-1.5 size-2 shrink-0 rounded-full",
                                    !n.read && "bg-primary",
                                )}
                            />
                            <span className="min-w-0 flex-1">
                                <NotificationText notification={n} />
                            </span>
                        </DropdownMenuItem>
                    ))
                )}
                {unread > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="justify-center text-xs text-primary focus:text-primary"
                            onClick={() => markRead(user.id)}
                        >
                            <CheckCheckIcon />
                            {t("dashboard.markAllRead")}
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
