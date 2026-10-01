import { Page } from "@/features/shared/page";
import { Verification } from "@/features/verification/verification";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("verification");

export default function VerificationPage() {
    return (
        <Page pageKey="verification">
            <Verification />
        </Page>
    );
}
