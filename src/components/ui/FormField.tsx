"use client";

import { useId, type ComponentProps, type ReactNode, type Ref } from "react";

import { FieldError } from "@/components/ui/FieldError";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

// Labelled wrappers around the theme primitives: label + control + hint/error
// with the aria wiring, so feature forms stay declarative.

interface FieldOwnProps {
    label?: string;
    hint?: string;
    error?: string;
}

function fieldAria(id: string, { hint, error }: FieldOwnProps) {
    const describedBy = [error && `${id}-error`, hint && `${id}-hint`]
        .filter(Boolean)
        .join(" ");
    return {
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy || undefined,
    } as const;
}

function Field({
    id,
    label,
    hint,
    error,
    className,
    children,
}: FieldOwnProps & { id: string; className?: string; children: ReactNode }) {
    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {label && <Label htmlFor={id}>{label}</Label>}
            {children}
            {error ? (
                <FieldError
                    id={`${id}-error`}
                    message={error}
                    className="-mt-0.5"
                />
            ) : (
                hint && (
                    <p
                        id={`${id}-hint`}
                        className="-mt-0.5 text-xs text-muted-foreground"
                    >
                        {hint}
                    </p>
                )
            )}
        </div>
    );
}

interface TextFieldProps extends ComponentProps<"input">, FieldOwnProps {
    /** Decorative content inside the field, e.g. a currency sign. */
    startAdornment?: ReactNode;
    endAdornment?: ReactNode;
    containerClassName?: string;
}

function TextField({
    id: idProp,
    label,
    hint,
    error,
    startAdornment,
    endAdornment,
    className,
    containerClassName,
    ...props
}: TextFieldProps) {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    return (
        <Field
            id={id}
            label={label}
            hint={hint}
            error={error}
            className={containerClassName}
        >
            <div className="relative">
                {startAdornment && (
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-muted-foreground [&_svg]:size-4">
                        {startAdornment}
                    </span>
                )}
                <Input
                    id={id}
                    className={cn(
                        startAdornment && "pl-9",
                        endAdornment && "pr-16",
                        className,
                    )}
                    {...fieldAria(id, { hint, error })}
                    {...props}
                />
                {endAdornment && (
                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-muted-foreground">
                        {endAdornment}
                    </span>
                )}
            </div>
        </Field>
    );
}

interface TextareaFieldProps extends ComponentProps<"textarea">, FieldOwnProps {
    containerClassName?: string;
}

function TextareaField({
    id: idProp,
    label,
    hint,
    error,
    containerClassName,
    ...props
}: TextareaFieldProps) {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    return (
        <Field
            id={id}
            label={label}
            hint={hint}
            error={error}
            className={containerClassName}
        >
            <Textarea id={id} {...fieldAria(id, { hint, error })} {...props} />
        </Field>
    );
}

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface SelectFieldProps extends FieldOwnProps {
    options: SelectOption[];
    /** Empty string means "nothing selected" and shows the placeholder. */
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    name?: string;
    placeholder?: string;
    disabled?: boolean;
    id?: string;
    containerClassName?: string;
    "aria-label"?: string;
    /** Focus target for react-hook-form (`Controller` passes it). */
    ref?: Ref<HTMLButtonElement>;
}

/** Controlled select — pair it with react-hook-form's `Controller`. */
function SelectField({
    id: idProp,
    label,
    hint,
    error,
    options,
    value,
    onChange,
    onBlur,
    name,
    placeholder,
    disabled,
    containerClassName,
    "aria-label": ariaLabel,
    ref,
}: SelectFieldProps) {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    return (
        <Field
            id={id}
            label={label}
            hint={hint}
            error={error}
            className={containerClassName}
        >
            <Select
                name={name}
                value={value === "" ? null : value}
                onValueChange={(next) => onChange(next ?? "")}
                onOpenChange={(open) => {
                    if (!open) onBlur?.();
                }}
                disabled={disabled}
                items={options}
            >
                <SelectTrigger
                    ref={ref}
                    id={id}
                    aria-label={ariaLabel}
                    className="w-full"
                    {...fieldAria(id, { hint, error })}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </Field>
    );
}

interface SwitchFieldProps {
    label: string;
    description?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
}

function SwitchField({
    label,
    description,
    checked,
    onCheckedChange,
    disabled,
    className,
}: SwitchFieldProps) {
    const id = useId();

    return (
        <div
            className={cn("flex items-start justify-between gap-4", className)}
        >
            <div className="min-w-0">
                <Label htmlFor={id} id={`${id}-label`}>
                    {label}
                </Label>
                {description && (
                    <p
                        id={`${id}-description`}
                        className="mt-1 text-xs text-muted-foreground"
                    >
                        {description}
                    </p>
                )}
            </div>
            <Switch
                id={id}
                checked={checked}
                onCheckedChange={(next) => onCheckedChange(next)}
                disabled={disabled}
                aria-labelledby={`${id}-label`}
                aria-describedby={description ? `${id}-description` : undefined}
            />
        </div>
    );
}

export { Field, SelectField, SwitchField, TextareaField, TextField };
