import type { ReactNode, Ref } from "react";

import { cn } from "@/lib/utils";

/**
 * One full-page landing section: at least one viewport tall, taller when the
 * content needs it. The page itself is the only scroller — FullPageScroll
 * scrolls through a tall section before moving on to the next one. The top
 * padding clears the fixed demo banner + navbar.
 */
export function SectionFrame({
    id,
    ref,
    background,
    className,
    contentClassName,
    children,
}: {
    id: string;
    ref?: Ref<HTMLElement>;
    /** Decorative layer behind the content. */
    background?: ReactNode;
    className?: string;
    contentClassName?: string;
    children: ReactNode;
}) {
    return (
        <section
            id={id}
            ref={ref}
            data-section
            className={cn("relative min-h-svh overflow-x-clip", className)}
        >
            {background}
            <div
                className={cn(
                    "relative flex min-h-svh flex-col justify-center pt-36 pb-12",
                    contentClassName,
                )}
            >
                {children}
            </div>
        </section>
    );
}
