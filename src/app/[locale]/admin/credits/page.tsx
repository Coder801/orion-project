import { CreditReviews } from "@/features/admin/ProductReviews";
import { Page } from "@/features/shared/Page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("credits");

export default function AdminCreditsPage() {
    return (
        <Page pageKey="credits">
            <CreditReviews />
        </Page>
    );
}
