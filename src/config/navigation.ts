import {
    ArrowDownToLineIcon,
    ArrowLeftRightIcon,
    ArrowUpFromLineIcon,
    BadgeCheckIcon,
    ClipboardListIcon,
    CreditCardIcon,
    FileTextIcon,
    HistoryIcon,
    InfoIcon,
    LandmarkIcon,
    LayoutDashboardIcon,
    LifeBuoyIcon,
    RepeatIcon,
    SendIcon,
    SettingsIcon,
    SlidersHorizontalIcon,
    UsersIcon,
    type LucideIcon,
} from "lucide-react";
import type en from "@/i18n/messages/en.json";

export type NavLabelKey = keyof typeof en.nav;
export type NavSectionKey = keyof typeof en.layout.navSections;

export interface NavItem {
    href: string;
    labelKey: NavLabelKey;
    icon: LucideIcon;
}

export interface NavSection {
    labelKey: NavSectionKey;
    items: NavItem[];
}

export type NavVariant = "app" | "admin";

export const NAV_SECTIONS: Record<NavVariant, NavSection[]> = {
    app: [
        {
            labelKey: "overview",
            items: [
                {
                    href: "/app/dashboard",
                    labelKey: "dashboard",
                    icon: LayoutDashboardIcon,
                },
                {
                    href: "/app/transactions",
                    labelKey: "transactions",
                    icon: HistoryIcon,
                },
            ],
        },
        {
            labelKey: "money",
            items: [
                {
                    href: "/app/deposit",
                    labelKey: "deposit",
                    icon: ArrowDownToLineIcon,
                },
                {
                    href: "/app/withdraw",
                    labelKey: "withdraw",
                    icon: ArrowUpFromLineIcon,
                },
                { href: "/app/transfer", labelKey: "transfer", icon: SendIcon },
                { href: "/app/convert", labelKey: "convert", icon: RepeatIcon },
            ],
        },
        {
            labelKey: "products",
            items: [
                { href: "/app/credit", labelKey: "credit", icon: LandmarkIcon },
                { href: "/app/cards", labelKey: "cards", icon: CreditCardIcon },
            ],
        },
        {
            labelKey: "account",
            items: [
                {
                    href: "/app/verification",
                    labelKey: "verification",
                    icon: BadgeCheckIcon,
                },
                {
                    href: "/app/account-details",
                    labelKey: "accountDetails",
                    icon: FileTextIcon,
                },
                {
                    href: "/app/settings",
                    labelKey: "settings",
                    icon: SettingsIcon,
                },
                {
                    href: "/app/support",
                    labelKey: "support",
                    icon: LifeBuoyIcon,
                },
                { href: "/app/about", labelKey: "about", icon: InfoIcon },
            ],
        },
    ],
    admin: [
        {
            labelKey: "people",
            items: [
                { href: "/admin/users", labelKey: "users", icon: UsersIcon },
            ],
        },
        {
            labelKey: "review",
            items: [
                {
                    href: "/admin/registrations",
                    labelKey: "registrations",
                    icon: BadgeCheckIcon,
                },
                {
                    href: "/admin/requests",
                    labelKey: "requests",
                    icon: ClipboardListIcon,
                },
                {
                    href: "/admin/conversions",
                    labelKey: "conversions",
                    icon: ArrowLeftRightIcon,
                },
                {
                    href: "/admin/credits",
                    labelKey: "credits",
                    icon: LandmarkIcon,
                },
                {
                    href: "/admin/card-orders",
                    labelKey: "cardOrders",
                    icon: CreditCardIcon,
                },
            ],
        },
        {
            labelKey: "platform",
            items: [
                {
                    href: "/admin/settings",
                    labelKey: "adminSettings",
                    icon: SlidersHorizontalIcon,
                },
            ],
        },
    ],
};

export function isNavItemActive(item: NavItem, pathname: string): boolean {
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Active nav item for the topbar title, if any. */
export function findActiveNavItem(
    variant: NavVariant,
    pathname: string,
): NavItem | undefined {
    return NAV_SECTIONS[variant]
        .flatMap((section) => section.items)
        .find((item) => isNavItemActive(item, pathname));
}
