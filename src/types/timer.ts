import {z} from "zod/mod.ts";

export const timerDurationsSchema = z.strictObject({
    POMATO: z.number().min(0),
    SHORT_BREAK: z.number().min(0),
    LONG_BREAK: z.number().min(0),
});
