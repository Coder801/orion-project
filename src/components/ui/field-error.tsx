import { cn } from "@/lib/utils";

function FieldError({
    id,
    message,
    className,
}: {
    id?: string;
    message?: string;
    className?: string;
}) {
    if (!message) return null;
    return (
        <p
            id={id}
            role="alert"
            className={cn("text-xs font-medium text-destructive", className)}
        >
            {message}
        </p>
    );
}

export { FieldError };
