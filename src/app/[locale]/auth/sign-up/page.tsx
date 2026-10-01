import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { SignUpForm } from "@/features/auth/SignUpForm";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("auth");
    return { title: t("signUp.title") };
}

export default function Page() {
    // Suspense: the form reads ?next= via useSearchParams.
    return (
        <Suspense>
            <SignUpForm />
        </Suspense>
    );
}
