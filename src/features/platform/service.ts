import { getRepository, withLatency } from "@/data/client";
import type { PlatformSettings } from "@/domain/types";

export function getPlatformSettings(): Promise<PlatformSettings> {
    return withLatency(() => getRepository().settings.get(), 100);
}
