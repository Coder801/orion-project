import { RequireKyc } from "@/features/auth/Guards";
import { UserRequests } from "@/features/payments/UserRequests";
import { Cards } from "@/features/products/Cards";
import { MoneyPausedNotice } from "@/features/shared/MoneyPausedNotice";
import { Page } from "@/features/shared/Page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("cards");

export default function CardsPage() {
    return (
        <Page pageKey="cards">
            <RequireKyc operation="cards">
                <div className="space-y-6">
                    <MoneyPausedNotice />
                    <Cards />
                    <UserRequests kinds={["card"]} />
                </div>
            </RequireKyc>
        </Page>
    );
}
