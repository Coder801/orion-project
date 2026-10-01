import { CardOrderReviews } from "@/features/admin/product-reviews";
import { Page } from "@/features/shared/page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("cardOrders");

export default function AdminCardOrdersPage() {
    return (
        <Page pageKey="cardOrders">
            <CardOrderReviews />
        </Page>
    );
}
