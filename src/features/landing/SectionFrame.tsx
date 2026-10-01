import type { ReactNode, Ref } from "react";

import { SectionDivider } from "@/components/site/SectionDivider";
import { cn } from "@/lib/utils";

/**
 * One full-page landing section: at least one viewport tall, taller when the
 * content needs it. The page itself is the only scroller — FullPageScroll
 * scrolls through a tall section before moving on to the next one. The top
 * padding clears the fixed demo banner + navbar.
 *
 * Below `lg` (no full-page scroll) sections are as tall as their content with
 * compact padding and a divider between them; only the first one (the hero)
 * still fills the screen and clears the header.
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
            className={cn(
                "group/frame relative scroll-mt-28 overflow-x-clip lg:min-h-svh lg:scroll-mt-0",
                className,
            )}
        >
            {background}
            <SectionDivider className="absolute inset-x-0 top-0 group-first/frame:hidden lg:hidden" />
            <div
                className={cn(
                    "relative flex flex-col justify-center py-16 group-first/frame:min-h-svh group-first/frame:pt-36 lg:min-h-svh lg:pt-36 lg:pb-12",
                    contentClassName,
                )}
            >
                {children}
            </div>
        </section>
    );
}
