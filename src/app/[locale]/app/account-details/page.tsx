import { AccountDetails } from "@/features/accounts/account-details";
import { Page } from "@/features/shared/page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("accountDetails");

export default function AccountDetailsPage() {
    return (
        <Page pageKey="accountDetails">
            <AccountDetails />
        </Page>
    );
}
