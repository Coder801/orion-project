import { getLocale } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import { redirect } from "@/i18n/navigation";

export default async function AppIndex() {
    redirect({ href: ROUTES.dashboard, locale: await getLocale() });
}
