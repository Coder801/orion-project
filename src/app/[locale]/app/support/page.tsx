import { Support } from "@/features/products/support";
import { Page } from "@/features/shared/page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("support");

export default function SupportPage() {
    return (
        <Page pageKey="support">
            <Support />
        </Page>
    );
}
