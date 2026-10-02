"use client";

import { CreditCardIcon, TruckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog";
import { SelectField, TextareaField } from "@/components/ui/FormField";
import { Skeleton } from "@/components/ui/Skeleton";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { cmpMinor } from "@/domain/money";
import { availableBalance, isKycApproved } from "@/domain/rules";
import type { Account, User } from "@/domain/types";
import { accountLabel } from "@/features/accounts/identifiers";
import { useApiErrorMessage } from "@/features/shared/errors";
import { FormError } from "@/features/shared/FormStatus";
import { Panel } from "@/features/shared/Panel";
import { StatusBadge } from "@/features/shared/StatusBadge";
import { useFormatMoney } from "@/lib/hooks/useMoney";
import {
    useOrderPhysicalCardMutation,
    usePlatformSettingsQuery,
    useUserRequestsQuery,
} from "@/store/api";

/** "Order physical card" call to action; price and delivery come from the backend. */
export function PhysicalCardCta({
    user,
    accounts,
}: {
    user: User;
    accounts: Account[];
}) {
    const t = useTranslations("dashboard.physicalCard");
    const tc = useTranslations("common");
    const tv = useTranslations("validation");
    const apiError = useApiErrorMessage();
    const formatMoney = useFormatMoney();
    const settings = usePlatformSettingsQuery();
    const requests = useUserRequestsQuery(user.id);
    const [order, { isLoading, error, reset }] = useOrderPhysicalCardMutation();
    const [open, setOpen] = useState(false);
    const [accountId, setAccountId] = useState("");
    const [address, setAddress] = useState("");
    const [addressError, setAddressError] = useState(false);

    const offer = settings.data?.physicalCard;
    const existing = (requests.data ?? []).find(
        (r) =>
            r.kind === "card" &&
            r.payload.product.kind === "physicalCard" &&
            r.status !== "rejected",
    );
    const payable = offer
        ? accounts.filter(
              (a) =>
                  a.currency === offer.currency &&
                  cmpMinor(availableBalance(a), offer.price) >= 0,
          )
        : [];

    const close = () => {
        setOpen(false);
        setAddressError(false);
        reset();
    };

    const confirm = async () => {
        if (!address.trim()) {
            setAddressError(true);
            return;
        }
        const result = await order({
            userId: user.id,
            input: { accountId, deliveryAddress: address },
        });
        if ("data" in result) {
            setAddress("");
            setAccountId("");
            close();
        }
    };

    return (
        <Panel
            title={
                <>
                    <CreditCardIcon
                        className="size-4 text-primary"
                        aria-hidden
                    />
                    {t("title")}
                </>
            }
        >
            {settings.isLoading || !offer ? (
                <Skeleton className="h-16 w-full" />
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {t("text", {
                            price: formatMoney(offer.price, offer.currency),
                            min: offer.deliveryDays.min,
                            max: offer.deliveryDays.max,
                        })}
                    </p>
                    {existing ? (
                        <p className="flex items-center gap-2 text-sm">
                            {t("ordered")}
                            <StatusBadge status={existing.status} />
                        </p>
                    ) : (
                        <Button
                            variant="gradient"
                            disabled={!isKycApproved(user)}
                            onClick={() => setOpen(true)}
                        >
                            {t("cta")}
                        </Button>
                    )}
                    {!isKycApproved(user) && !existing && (
                        <p className="text-xs text-muted-foreground">
                            {t("kycNote")}
                        </p>
                    )}
                </div>
            )}

            <Dialog open={open} onOpenChange={(next) => !next && close()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("dialogTitle")}</DialogTitle>
                        <DialogDescription>
                            {t("dialogDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <FormError message={apiError(error)} />
                    {offer && (
                        <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-4">
                            <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                <TruckIcon className="size-4" aria-hidden />
                                {t("delivery", offer.deliveryDays)}
                            </span>
                            <span className="font-heading text-xl font-bold tabular-nums">
                                {formatMoney(offer.price, offer.currency)}
                            </span>
                        </div>
                    )}
                    <SelectField
                        label={t("payFrom")}
                        placeholder={t("chooseAccount")}
                        value={accountId}
                        onChange={setAccountId}
                        hint={
                            payable.length === 0 && offer
                                ? t("noFunds", { currency: offer.currency })
                                : undefined
                        }
                        options={payable.map((a) => ({
                            value: a.id,
                            label: `${accountLabel(a)} — ${formatMoney(availableBalance(a), a.currency)}`,
                        }))}
                    />
                    <TextareaField
                        label={t("address")}
                        rows={3}
                        autoComplete="street-address"
                        maxLength={200}
                        value={address}
                        error={addressError ? tv("required") : undefined}
                        onChange={(event) => {
                            setAddress(event.target.value);
                            setAddressError(false);
                        }}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={close}>
                            {tc("cancel")}
                        </Button>
                        <SubmitButton
                            type="button"
                            pending={isLoading}
                            pendingLabel={tc("loading")}
                            variant="gradient"
                            disabled={!accountId}
                            onClick={confirm}
                        >
                            {t("confirm")}
                        </SubmitButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Panel>
    );
}
