import { RequireKyc } from "@/features/auth/guards";
import { MovementForm } from "@/features/payments/movement-form";
import { UserRequests } from "@/features/payments/user-requests";
import { Page } from "@/features/shared/page";
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
