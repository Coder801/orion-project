import { RequireKyc } from "@/features/auth/guards";
import { UserRequests } from "@/features/payments/user-requests";
import { Page } from "@/features/shared/page";
import { TransferForm } from "@/features/transfer/transfer-form";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("transfer");

export default function TransferPage() {
    return (
        <Page pageKey="transfer">
            <RequireKyc operation="transfer">
                <div className="space-y-6">
                    <TransferForm />
                    <UserRequests kinds={["transfer"]} />
                </div>
            </RequireKyc>
        </Page>
    );
}
