import { CardOrderReviews } from "@/features/admin/ProductReviews";
import { Page } from "@/features/shared/Page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("cardOrders");

export default function AdminCardOrdersPage() {
    return (
        <Page pageKey="cardOrders">
            <CardOrderReviews />
        </Page>
    );
}
