import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";

/** Form-level error (e.g. from the mock API), announced to screen readers. */
export function FormError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
            <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            {message}
        </p>
    );
}

/** Inline success confirmation after a form submit. */
export function FormSuccess({
    show,
    message,
}: {
    show: boolean;
    message: string;
}) {
    if (!show) return null;
    return (
        <p
            role="status"
            className="flex items-start gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
        >
            <CircleCheckIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            {message}
        </p>
    );
}
