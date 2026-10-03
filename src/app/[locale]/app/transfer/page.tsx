import { RequireKyc } from "@/features/auth/Guards";
import { UserRequests } from "@/features/payments/UserRequests";
import { MoneyPausedNotice } from "@/features/shared/MoneyPausedNotice";
import { Page } from "@/features/shared/Page";
import { TransferForm } from "@/features/transfer/TransferForm";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("transfer");

export default function TransferPage() {
    return (
        <Page pageKey="transfer">
            <RequireKyc operation="transfer">
                <div className="space-y-6">
                    <MoneyPausedNotice />
                    <TransferForm />
                    <UserRequests kinds={["transfer"]} />
                </div>
            </RequireKyc>
        </Page>
    );
}
