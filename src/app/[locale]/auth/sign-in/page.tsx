import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { SignInForm } from "@/features/auth/SignInForm";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("auth");
    return { title: t("signIn.title") };
}

export default function Page() {
    // Suspense: the form reads ?next= via useSearchParams.
    return (
        <Suspense>
            <SignInForm />
        </Suspense>
    );
}
