import { Page } from "@/features/shared/Page";
import { Verification } from "@/features/verification/Verification";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("verification");

export default function VerificationPage() {
    return (
        <Page pageKey="verification">
            <Verification />
        </Page>
    );
}
