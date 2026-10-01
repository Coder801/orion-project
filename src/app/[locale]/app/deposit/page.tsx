import { RequireKyc } from "@/features/auth/guards";
import { MovementForm } from "@/features/payments/movement-form";
import { UserRequests } from "@/features/payments/user-requests";
import { Page } from "@/features/shared/page";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = pageMetadata("deposit");

export default function DepositPage() {
    return (
        <Page pageKey="deposit">
            <RequireKyc operation="deposit">
                <div className="space-y-6">
                    <MovementForm kind="deposit" />
                    <UserRequests kinds={["deposit"]} />
                </div>
            </RequireKyc>
        </Page>
    );
}
