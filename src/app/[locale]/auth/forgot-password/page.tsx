import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("auth");
    return { title: t("forgot.title") };
}

export default function Page() {
    return <ForgotPasswordForm />;
}
