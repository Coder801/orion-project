import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// Icon zooms on card hover via CSS group-hover, so the nearest card must carry
// `group`. className styles the tile (not flex/grid), iconClassName the icon.
export function IconTile({
    icon: Icon,
    className,
    iconClassName,
}: {
    icon: LucideIcon;
    className?: string;
    iconClassName?: string;
}) {
    return (
        <div
            aria-hidden
            className={cn("grid shrink-0 place-items-center", className)}
        >
            <Icon
                className={cn(
                    "transition-transform duration-300 ease-out group-hover:scale-125",
                    iconClassName,
                )}
            />
        </div>
    );
}
