import { LoaderCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/Button";

export function SubmitButton({
    pending,
    pendingLabel,
    disabled,
    children,
    ...props
}: React.ComponentProps<typeof Button> & {
    pending: boolean;
    pendingLabel: string;
}) {
    return (
        <Button
            type="submit"
            disabled={pending || disabled}
            aria-busy={pending || undefined}
            {...props}
        >
            {pending ? (
                <>
                    <LoaderCircleIcon className="animate-spin" aria-hidden />
                    {pendingLabel}
                </>
            ) : (
                children
            )}
        </Button>
    );
}
