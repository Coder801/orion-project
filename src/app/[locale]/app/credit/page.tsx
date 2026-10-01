import { RequireKyc } from "@/features/auth/Guards";
import { Credit } from "@/features/products/Credit";
import { Page } from "@/features/shared/Page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("credit");

export default function CreditPage() {
    return (
        <Page pageKey="credit">
            <RequireKyc operation="credit">
                <Credit />
            </RequireKyc>
        </Page>
    );
}
