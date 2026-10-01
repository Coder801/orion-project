"use client";

import { useEffect, type ReactNode } from "react";
import { useTranslations } from "next-intl";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/Sheet";
import type { NavVariant } from "@/config/navigation";
import { usePathname } from "@/i18n/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    selectIsSidebarCollapsed,
    selectIsSidebarOpen,
    sidebarClosed,
    sidebarCollapseToggled,
    sidebarOpened,
} from "@/store/uiSlice";
import { cn } from "@/lib/utils";

/** Sidebar + topbar frame shared by the user area and the admin panel. */
export function AppShell({
    variant,
    children,
}: {
    variant: NavVariant;
    children: ReactNode;
}) {
    const t = useTranslations("layout");
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const collapsed = useAppSelector(selectIsSidebarCollapsed);
    const mobileOpen = useAppSelector(selectIsSidebarOpen);

    useEffect(() => {
        dispatch(sidebarClosed());
    }, [pathname, dispatch]);

    return (
        <div className="min-h-[calc(100dvh-2rem)] bg-background">
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:top-10 focus:left-4 focus:z-70 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
            >
                {t("skipToContent")}
            </a>

            <aside
                className={cn(
                    "fixed top-8 bottom-0 left-0 z-40 hidden border-r border-sidebar-border transition-[width] duration-300 ease-in-out lg:block",
                    collapsed ? "w-19" : "w-64",
                )}
            >
                <AppSidebar variant={variant} collapsed={collapsed} />
            </aside>

            <Sheet
                open={mobileOpen}
                onOpenChange={(open) =>
                    dispatch(open ? sidebarOpened() : sidebarClosed())
                }
            >
                {/* top-8: stay below the always-visible demo banner. */}
                <SheetContent
                    side="left"
                    className="top-8 h-auto w-72 gap-0 border-sidebar-border bg-sidebar p-0"
                >
                    <SheetTitle className="sr-only">
                        {t("mainNavigation")}
                    </SheetTitle>
                    <AppSidebar
                        variant={variant}
                        onNavigate={() => dispatch(sidebarClosed())}
                    />
                </SheetContent>
            </Sheet>

            <div
                className={cn(
                    "flex min-h-[calc(100dvh-2rem)] flex-col transition-[padding-left] duration-300 ease-in-out",
                    collapsed ? "lg:pl-19" : "lg:pl-64",
                )}
            >
                <AppTopbar
                    variant={variant}
                    onToggleSidebar={() => dispatch(sidebarCollapseToggled())}
                    onOpenMobileNav={() => dispatch(sidebarOpened())}
                />
                <main
                    id="main"
                    tabIndex={-1}
                    className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 outline-hidden sm:px-6 lg:px-8 lg:py-8"
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
