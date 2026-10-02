import { ArrowRightIcon, ExternalLinkIcon, LifeBuoyIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import {
    ABOUT_CONFIG,
    ABOUT_VERIFIED_ICON as VerifiedIcon,
    type AboutConfig,
    type AboutItem,
} from "@/config/about";
import { ROUTES } from "@/config/routes";
import { Panel } from "@/features/shared/Panel";
import { Link } from "@/i18n/navigation";

function ItemGrid({
    section,
    items,
    columns,
}: {
    section: "advantages" | "services";
    items: AboutItem[];
    columns: string;
}) {
    const t = useTranslations(`about.${section}`);
    return (
        <ul className={`grid gap-4 ${columns}`}>
            {items.map(({ key, icon: Icon }) => (
                <li key={key} className="rounded-2xl border bg-card p-5">
                    <span
                        aria-hidden
                        className="grid size-10 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary"
                    >
                        <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 font-heading font-semibold">
                        {t(`${key as "multiCurrency"}.title`)}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t(`${key as "multiCurrency"}.text`)}
                    </p>
                </li>
            ))}
        </ul>
    );
}

/** Informational page; content is driven by `config/about.ts` + i18n. */
export function About({ config = ABOUT_CONFIG }: { config?: AboutConfig }) {
    const t = useTranslations("about");
    const { license, metrics } = config;

    return (
        <div className="space-y-10">
            <section
                aria-labelledby="about-hero"
                className="relative overflow-hidden rounded-3xl border bg-card p-6 sm:p-10"
            >
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-primary/15 blur-3xl"
                />
                <div className="relative max-w-2xl">
                    <h2
                        id="about-hero"
                        className="font-heading text-3xl font-bold tracking-tight sm:text-4xl"
                    >
                        <span className="text-gradient">{t("hero.title")}</span>
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        {t("hero.subtitle")}
                    </p>
                    <Button asChild variant="gradient" className="mt-6">
                        <Link href={ROUTES.deposit}>
                            {t("hero.cta")}
                            <ArrowRightIcon aria-hidden />
                        </Link>
                    </Button>
                </div>
            </section>

            <section aria-labelledby="about-advantages" className="space-y-4">
                <h2
                    id="about-advantages"
                    className="font-heading text-lg font-semibold"
                >
                    {t("advantages.title")}
                </h2>
                <ItemGrid
                    section="advantages"
                    items={config.advantages}
                    columns="sm:grid-cols-2 xl:grid-cols-4"
                />
            </section>

            <section aria-labelledby="about-services" className="space-y-4">
                <h2
                    id="about-services"
                    className="font-heading text-lg font-semibold"
                >
                    {t("services.title")}
                </h2>
                <ItemGrid
                    section="services"
                    items={config.services}
                    columns="sm:grid-cols-2 lg:grid-cols-3"
                />
            </section>

            {license && (
                <Panel
                    title={
                        <>
                            <VerifiedIcon
                                className="size-4 text-success"
                                aria-hidden
                            />
                            {t("license.title")}
                        </>
                    }
                >
                    <dl className="grid gap-4 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="text-muted-foreground">
                                {t("license.number")}
                            </dt>
                            <dd className="font-medium">{license.number}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">
                                {t("license.regulator")}
                            </dt>
                            <dd className="font-medium">{license.regulator}</dd>
                        </div>
                    </dl>
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="mt-4"
                    >
                        <a
                            href={license.registryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {t("license.registry")}
                            <ExternalLinkIcon aria-hidden />
                        </a>
                    </Button>
                </Panel>
            )}

            {metrics && metrics.length > 0 && (
                <section aria-labelledby="about-metrics">
                    <h2 id="about-metrics" className="sr-only">
                        {t("metrics.title")}
                    </h2>
                    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {metrics.map((metric) => (
                            <div
                                key={metric.key}
                                className="rounded-2xl border bg-card p-5"
                            >
                                <dt className="text-xs text-muted-foreground">
                                    {t(`metrics.${metric.key as "title"}`)}
                                </dt>
                                <dd className="mt-1 font-heading text-2xl font-bold">
                                    {metric.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </section>
            )}

            <section
                aria-labelledby="about-cta"
                className="flex flex-col items-start justify-between gap-4 rounded-3xl border bg-linear-to-r from-primary/10 to-secondary/10 p-6 sm:flex-row sm:items-center sm:p-8"
            >
                <div>
                    <h2
                        id="about-cta"
                        className="font-heading text-xl font-semibold"
                    >
                        {t("cta.title")}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t("cta.text")}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="gradient">
                        <Link href={ROUTES.dashboard}>{t("cta.button")}</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href={ROUTES.support}>
                            <LifeBuoyIcon aria-hidden />
                            {t("cta.support")}
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
