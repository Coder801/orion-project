import { useTranslations } from "next-intl";

import { Logo } from "@/components/Logo";
import { SectionDivider } from "@/components/site/SectionDivider";
import { LANDING_NAV } from "@/config/landing";
import { ROUTES } from "@/config/routes";
import { Link } from "@/i18n/navigation";

const linkClassName =
    "text-sm text-muted-foreground transition-colors hover:text-foreground";

export function LandingFooter() {
    const t = useTranslations("landing");

    return (
        <footer id="footer" data-section className="relative border-t">
            <SectionDivider className="absolute inset-x-0 top-0" />
            <div className="container-wide py-16 lg:py-20">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_2fr]">
                    <div className="flex max-w-sm flex-col gap-6">
                        <Logo />
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {t("footer.tagline")}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <nav aria-labelledby="footer-product">
                            <h2
                                id="footer-product"
                                className="mb-4 font-heading text-sm font-semibold"
                            >
                                {t("footer.product")}
                            </h2>
                            <ul className="flex flex-col gap-1.5">
                                {LANDING_NAV.map((section) => (
                                    <li key={section}>
                                        <a
                                            href={`#${section}`}
                                            className={linkClassName}
                                        >
                                            {t(`nav.${section}`)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        <nav aria-labelledby="footer-account">
                            <h2
                                id="footer-account"
                                className="mb-4 font-heading text-sm font-semibold"
                            >
                                {t("footer.account")}
                            </h2>
                            <ul className="flex flex-col gap-1.5">
                                <li>
                                    <Link
                                        href={ROUTES.signIn}
                                        className={linkClassName}
                                    >
                                        {t("nav.login")}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={ROUTES.signUp}
                                        className={linkClassName}
                                    >
                                        {t("nav.openAccount")}
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>

                <div className="mt-16 flex flex-col gap-4 border-t pt-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
                    <p className="max-w-2xl">{t("footer.disclaimer")}</p>
                    <p className="shrink-0">
                        {t("footer.rights", { year: new Date().getFullYear() })}
                    </p>
                </div>
            </div>
        </footer>
    );
}
