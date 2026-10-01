import { CreditReviews } from "@/features/admin/product-reviews";
import { Page } from "@/features/shared/page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("credits");

export default function AdminCreditsPage() {
    return (
        <Page pageKey="credits">
            <CreditReviews />
        </Page>
    );
}
