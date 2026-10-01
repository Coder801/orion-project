import { AccountDetails } from "@/features/accounts/AccountDetails";
import { Page } from "@/features/shared/Page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("accountDetails");

export default function AccountDetailsPage() {
    return (
        <Page pageKey="accountDetails">
            <AccountDetails />
        </Page>
    );
}
