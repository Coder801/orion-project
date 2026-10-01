import { RequireKyc } from "@/features/auth/Guards";
import { Cards } from "@/features/products/Cards";
import { Page } from "@/features/shared/Page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("cards");

export default function CardsPage() {
    return (
        <Page pageKey="cards">
            <RequireKyc operation="cards">
                <Cards />
            </RequireKyc>
        </Page>
    );
}
