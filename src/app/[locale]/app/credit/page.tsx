import { RequireKyc } from "@/features/auth/guards";
import { Credit } from "@/features/products/credit";
import { Page } from "@/features/shared/page";
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
