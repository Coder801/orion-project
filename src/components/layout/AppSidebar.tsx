"use client";

import { useTranslations } from "next-intl";
import {
    ChevronsUpDownIcon,
    LogOutIcon,
    SettingsIcon,
    ShieldIcon,
} from "lucide-react";

import { Logo, LogoMark } from "@/components/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/Tooltip";
import {
    isNavItemActive,
    NAV_SECTIONS,
    type NavItem,
    type NavVariant,
} from "@/config/navigation";
import { useCurrentUser } from "@/features/auth/session";
import { useSignOut } from "@/features/auth/useSignOut";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useMeQuery } from "@/store/api";

export function getInitials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");
}

function NavLink({
    item,
    active,
    collapsed,
    onNavigate,
}: {
    item: NavItem;
    active: boolean;
    collapsed: boolean;
    onNavigate?: () => void;
}) {
    const t = useTranslations("nav");
    const label = t(item.labelKey);
    const link = (
        <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            aria-label={collapsed ? label : undefined}
            className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200",
                active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                collapsed && "justify-center px-0",
            )}
        >
            <span
                aria-hidden
                className={cn(
                    "absolute top-1/2 -left-3 h-5 w-0.75 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-300",
                    active ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0",
                )}
            />
            <item.icon
                aria-hidden
                className={cn(
                    "size-4.5 shrink-0 transition-colors",
                    active
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground",
                )}
            />
            {!collapsed && <span className="flex-1 truncate">{label}</span>}
        </Link>
    );

    if (!collapsed) return link;

    return (
        <Tooltip>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
    );
}

export function AppSidebar({
    variant,
    collapsed = false,
    onNavigate,
}: {
    variant: NavVariant;
    collapsed?: boolean;
    onNavigate?: () => void;
}) {
    const t = useTranslations("layout");
    const pathname = usePathname();
    const user = useCurrentUser();
    const { data: me } = useMeQuery(user.id);
    const signOut = useSignOut();
    const sections = NAV_SECTIONS[variant];
    const homeHref = sections[0]?.items[0]?.href ?? "/";

    return (
        <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
            <div
                className={cn(
                    "flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border",
                    collapsed ? "justify-center px-2" : "px-5",
                )}
            >
                {collapsed ? (
                    <Link href={homeHref} aria-label={t("logoLabel")}>
                        <LogoMark className="size-7" />
                    </Link>
                ) : (
                    <>
                        <Logo href={homeHref} />
                        {variant === "admin" && (
                            <Badge
                                variant="accent"
                                className="px-2 py-0 text-[10px]"
                            >
                                <ShieldIcon aria-hidden />
                                {t("adminBadge")}
                            </Badge>
                        )}
                    </>
                )}
            </div>

            <nav
                className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-3 py-5"
                aria-label={t("mainNavigation")}
            >
                {sections.map((section) => (
                    <div key={section.labelKey}>
                        {!collapsed ? (
                            <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                                {t(`navSections.${section.labelKey}`)}
                            </p>
                        ) : (
                            <div
                                aria-hidden
                                className="mx-auto mb-2 h-px w-6 bg-sidebar-border"
                            />
                        )}
                        <div className="space-y-1">
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.href}
                                    item={item}
                                    active={isNavItemActive(item, pathname)}
                                    collapsed={collapsed}
                                    onNavigate={onNavigate}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="border-t border-sidebar-border p-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            aria-label={t("accountMenu")}
                            className={cn(
                                "flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 text-left outline-hidden transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50",
                                collapsed && "justify-center",
                            )}
                        >
                            <Avatar className="size-9">
                                {me?.avatar && (
                                    <AvatarImage src={me.avatar} alt="" />
                                )}
                                <AvatarFallback>
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            {!collapsed && (
                                <>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium">
                                            {user.name}
                                        </span>
                                        <span className="block truncate text-[11px] text-muted-foreground">
                                            {user.email}
                                        </span>
                                    </span>
                                    <ChevronsUpDownIcon
                                        aria-hidden
                                        className="size-4 shrink-0 text-muted-foreground"
                                    />
                                </>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side={collapsed ? "right" : "top"}
                        align={collapsed ? "end" : "center"}
                        className="w-56"
                    >
                        <DropdownMenuLabel>
                            <span className="block text-sm font-medium text-foreground">
                                {user.name}
                            </span>
                            <span className="block truncate text-xs font-normal">
                                {user.email}
                            </span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {variant === "app" && (
                            <DropdownMenuItem asChild>
                                <Link href="/app/settings" onClick={onNavigate}>
                                    <SettingsIcon />
                                    {t("settings")}
                                </Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={signOut}
                        >
                            <LogOutIcon />
                            {t("logout")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
