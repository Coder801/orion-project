import { Support } from "@/features/products/Support";
import { Page } from "@/features/shared/Page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("support");

export default function SupportPage() {
    return (
        <Page pageKey="support">
            <Support />
        </Page>
    );
}
