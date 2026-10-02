import { RequireKyc } from "@/features/auth/Guards";
import { DepositForm } from "@/features/payments/DepositForm";
import { UserRequests } from "@/features/payments/UserRequests";
import { Page } from "@/features/shared/Page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("deposit");

export default function DepositPage() {
    return (
        <Page pageKey="deposit">
            <RequireKyc operation="deposit">
                <div className="space-y-6">
                    <DepositForm />
                    <UserRequests kinds={["deposit"]} />
                </div>
            </RequireKyc>
        </Page>
    );
}
