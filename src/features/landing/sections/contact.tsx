"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ClockIcon, MailIcon, MapPinIcon, SendIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuroraBackground } from "@/components/effects/aurora-background";
import { Badge } from "@/components/ui/badge";
import {
    SelectField,
    TextareaField,
    TextField,
} from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import {
    CONTACT_TOPICS,
    contactSchema,
    type ContactValues,
} from "@/features/landing/contact-schema";
import { SECTION_FADE_MASK, useEnterTimeline } from "@/features/landing/motion";
import { SectionFrame } from "@/features/landing/section-frame";
import { useApiErrorMessage, useFieldError } from "@/features/shared/errors";
import { FormError } from "@/features/shared/form-status";
import { gsap, MOTION_QUERIES, useGSAP } from "@/lib/gsap";
import { useSendContactMessageMutation } from "@/store/api";

const INFO = [
    { key: "email", icon: MailIcon },
    { key: "hours", icon: ClockIcon },
    { key: "address", icon: MapPinIcon },
] as const;

export function Contact() {
    const t = useTranslations("landing.contact");
    const tNav = useTranslations("landing.nav");
    const tc = useTranslations("common");
    const fieldError = useFieldError();
    const apiError = useApiErrorMessage();
    const scope = useRef<HTMLElement>(null);
    const [send, { isLoading, error }] = useSendContactMessageMutation();
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<ContactValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: { name: "", email: "", message: "" },
    });

    const onSubmit = handleSubmit(async (values) => {
        const result = await send(values);
        if ("data" in result) {
            reset();
            toast.success(t("sent"));
        }
    });

    useEnterTimeline(scope, (tl) => {
        tl.from(
            "[data-contact-form]",
            { y: 120, rotate: 2, autoAlpha: 0, duration: 1.1 },
            0.2,
        );
    });

    // The oversized backdrop word drifts against the page transition.
    useGSAP(
        () => {
            const mm = gsap.matchMedia();
            mm.add(MOTION_QUERIES.motion, () => {
                gsap.fromTo(
                    "[data-contact-word]",
                    { xPercent: 10 },
                    {
                        xPercent: -30,
                        ease: "none",
                        scrollTrigger: {
                            trigger: scope.current,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true,
                        },
                    },
                );
            });
        },
        { scope },
    );

    return (
        <SectionFrame
            id="contact"
            ref={scope}
            background={
                <>
                    <AuroraBackground
                        intensity="subtle"
                        className={SECTION_FADE_MASK}
                    />
                    <p
                        data-contact-word
                        aria-hidden
                        className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 font-heading text-[22vw] leading-none font-bold whitespace-nowrap text-foreground/[0.04] select-none"
                    >
                        {tNav("contact")}
                    </p>
                </>
            }
        >
            <div className="container-wide grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
                <div className="flex flex-col justify-center">
                    <Badge
                        data-reveal
                        variant="glow"
                        className="tracking-widest uppercase"
                    >
                        {t("eyebrow")}
                    </Badge>
                    <h2
                        data-reveal
                        className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
                    >
                        {t("title")}
                    </h2>
                    <dl className="mt-10 space-y-5">
                        {INFO.map(({ key, icon: Icon }) => (
                            <div
                                key={key}
                                data-reveal
                                className="flex items-center gap-4"
                            >
                                <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                                    <Icon className="size-5" aria-hidden />
                                </span>
                                <div>
                                    <dt className="text-xs text-muted-foreground">
                                        {t(`info.${key}Label`)}
                                    </dt>
                                    <dd className="font-medium">
                                        {t(`info.${key}Value`)}
                                    </dd>
                                </div>
                            </div>
                        ))}
                    </dl>
                </div>

                <div
                    data-contact-form
                    className="rounded-3xl border p-7 shadow-2xl glass-strong sm:p-10"
                >
                    <form onSubmit={onSubmit} noValidate className="space-y-5">
                        <FormError message={apiError(error)} />
                        <div className="grid gap-5 sm:grid-cols-2">
                            <TextField
                                label={t("fields.name")}
                                autoComplete="name"
                                error={fieldError(errors.name)}
                                {...register("name")}
                            />
                            <TextField
                                type="email"
                                label={t("fields.email")}
                                autoComplete="email"
                                error={fieldError(errors.email)}
                                {...register("email")}
                            />
                        </div>
                        <Controller
                            control={control}
                            name="topic"
                            render={({ field }) => (
                                <SelectField
                                    {...field}
                                    value={field.value ?? ""}
                                    label={t("fields.topic")}
                                    placeholder={t("fields.choose")}
                                    options={CONTACT_TOPICS.map((topic) => ({
                                        value: topic,
                                        label: t(`topics.${topic}`),
                                    }))}
                                    error={fieldError(errors.topic)}
                                />
                            )}
                        />
                        <TextareaField
                            label={t("fields.message")}
                            rows={4}
                            error={fieldError(errors.message)}
                            {...register("message")}
                        />
                        <SubmitButton
                            pending={isLoading}
                            pendingLabel={tc("loading")}
                            variant="gradient"
                            size="lg"
                            className="w-full"
                        >
                            <SendIcon aria-hidden />
                            {t("submit")}
                        </SubmitButton>
                    </form>
                </div>
            </div>
        </SectionFrame>
    );
}
