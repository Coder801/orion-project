"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "@/lib/utils";

function Slider({
    className,
    defaultValue,
    value,
    min = 0,
    max = 100,
    onValueChange,
    ...props
}: Omit<React.ComponentProps<typeof SliderPrimitive.Root>, "onValueChange"> & {
    onValueChange?: (value: number[]) => void;
}) {
    const _values = React.useMemo(
        () =>
            Array.isArray(value)
                ? value
                : Array.isArray(defaultValue)
                  ? defaultValue
                  : [min],
        [value, defaultValue, min],
    );

    return (
        <SliderPrimitive.Root
            data-slot="slider"
            defaultValue={defaultValue}
            value={value}
            min={min}
            max={max}
            onValueChange={
                onValueChange
                    ? (next) =>
                          onValueChange(
                              Array.isArray(next) ? [...next] : [next],
                          )
                    : undefined
            }
            className={cn(
                "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
                className,
            )}
            {...props}
        >
            <SliderPrimitive.Control className="relative flex w-full grow items-center data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col">
                <SliderPrimitive.Track
                    data-slot="slider-track"
                    className="relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
                >
                    <SliderPrimitive.Indicator
                        data-slot="slider-range"
                        className="absolute bg-linear-to-r from-primary to-secondary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
                    />
                    {Array.from({ length: _values.length }, (_, index) => (
                        <SliderPrimitive.Thumb
                            data-slot="slider-thumb"
                            key={index}
                            index={index}
                            className="block size-4 shrink-0 cursor-grab rounded-full border-2 border-primary bg-background shadow transition-shadow hover:shadow-[0_0_0_6px_rgba(91,91,247,0.15)] focus-visible:shadow-[0_0_0_6px_rgba(91,91,247,0.2)] focus-visible:outline-hidden active:cursor-grabbing data-disabled:pointer-events-none"
                        />
                    ))}
                </SliderPrimitive.Track>
            </SliderPrimitive.Control>
        </SliderPrimitive.Root>
    );
}

export { Slider };
