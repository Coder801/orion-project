import { RequireKyc } from "@/features/auth/Guards";
import { MovementForm } from "@/features/payments/MovementForm";
import { UserRequests } from "@/features/payments/UserRequests";
import { Page } from "@/features/shared/Page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("withdraw");

export default function WithdrawPage() {
    return (
        <Page pageKey="withdraw">
            <RequireKyc operation="withdraw">
                <div className="space-y-6">
                    <MovementForm kind="withdrawal" />
                    <UserRequests kinds={["withdrawal"]} />
                </div>
            </RequireKyc>
        </Page>
    );
}
