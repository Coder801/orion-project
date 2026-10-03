import { PauseCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";

/** Shown on request pages while balances live in the API but requests are still mock. */
export function MoneyPausedNotice() {
    const t = useTranslations("moneyPaused");
    return (
        <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm"
        >
            <PauseCircleIcon
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-warning"
            />
            <div>
                <p className="font-medium">{t("title")}</p>
                <p className="mt-0.5 text-muted-foreground">
                    {t("description")}
                </p>
            </div>
        </div>
    );
}
