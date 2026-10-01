import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface AsyncContentProps {
    isLoading: boolean;
    isError: boolean;
    isEmpty?: boolean;
    onRetry?: () => void;
    empty?: {
        title: string;
        description?: string;
        icon?: LucideIcon;
        action?: ReactNode;
    };
    /** Custom skeleton; defaults to a few bars. */
    skeleton?: ReactNode;
    loadingLabel: string;
    /** Extra classes for the loading/error/empty states (e.g. padding inside a flush panel). */
    stateClassName?: string;
    children: ReactNode;
}

/** Loading → error → empty → content, the three list states every screen needs. */
export function AsyncContent({
    isLoading,
    isError,
    isEmpty = false,
    onRetry,
    empty,
    skeleton,
    loadingLabel,
    stateClassName,
    children,
}: AsyncContentProps) {
    if (isLoading) {
        return (
            <div
                aria-busy="true"
                aria-label={loadingLabel}
                className={cn("space-y-3", stateClassName)}
            >
                {skeleton ?? (
                    <>
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-2/3" />
                    </>
                )}
            </div>
        );
    }
    if (isError)
        return <ErrorState onRetry={onRetry} className={stateClassName} />;
    if (isEmpty && empty)
        return <EmptyState {...empty} className={stateClassName} />;
    return <>{children}</>;
}
