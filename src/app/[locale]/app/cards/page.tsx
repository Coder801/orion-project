import { RequireKyc } from "@/features/auth/guards";
import { Cards } from "@/features/products/cards";
import { Page } from "@/features/shared/page";
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
