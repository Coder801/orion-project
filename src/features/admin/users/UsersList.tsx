"use client";

import { ChevronRightIcon, SearchIcon, UsersIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/FormField";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { adminUserRoute } from "@/config/routes";
import type { User } from "@/domain/types";
import { useCurrentUser } from "@/features/auth/session";
import { AsyncContent } from "@/features/shared/AsyncContent";
import { Panel } from "@/features/shared/Panel";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import { useAdminUsersQuery } from "@/store/api";

export function RoleBadge({ role }: { role: User["role"] }) {
    const t = useTranslations("admin.users");
    return (
        <Badge
            variant={role === "admin" ? "accent" : "secondary"}
            className="px-2.5 py-0.5"
        >
            {t(`roles.${role}`)}
        </Badge>
    );
}

function matches(user: User, query: string): boolean {
    const q = query.trim().toLowerCase();
    return (
        !q ||
        user.email.toLowerCase().includes(q) ||
        user.name.toLowerCase().includes(q)
    );
}

/** Every registered user; each row opens the admin user page. */
export function UsersList() {
    const t = useTranslations("admin.users");
    const language = useLocale();
    const admin = useCurrentUser();
    const {
        data = [],
        isLoading,
        isError,
        refetch,
    } = useAdminUsersQuery(admin.id);
    const [query, setQuery] = useState("");
    const rows = data.filter((user) => matches(user, query));
    const isEmpty = rows.length === 0;

    return (
        <Panel
            toolbar={
                <TextField
                    type="search"
                    label={t("search")}
                    placeholder={t("searchPlaceholder")}
                    startAdornment={<SearchIcon aria-hidden />}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    containerClassName="sm:max-w-sm"
                />
            }
            flush={!isLoading && !isError && !isEmpty}
        >
            <AsyncContent
                isLoading={isLoading}
                isError={isError}
                isEmpty={isEmpty}
                onRetry={refetch}
                loadingLabel={t("loading")}
                empty={{ title: t("empty"), icon: UsersIcon }}
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
                            <TableHead>{t("registered")}</TableHead>
                            <TableHead className="pr-5 text-right lg:pr-6">
                                <span className="sr-only">{t("actions")}</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="pl-5 font-medium lg:pl-6">
                                    {user.email}
                                </TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>
                                    <RoleBadge role={user.role} />
                                </TableCell>
                                <TableCell>
                                    {user.role === "user" ? (
                                        <StatusBadge status={user.kycStatus} />
                                    ) : (
                                        "—"
                                    )}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDate(user.createdAt, language)}
                                </TableCell>
                                <TableCell className="pr-5 text-right lg:pr-6">
                                    {user.role === "user" && (
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="ghost"
                                        >
                                            <Link
                                                href={adminUserRoute(user.id)}
                                                aria-label={`${t("open")}: ${user.email}`}
                                            >
                                                {t("open")}
                                                <ChevronRightIcon aria-hidden />
                                            </Link>
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </AsyncContent>
        </Panel>
    );
}
