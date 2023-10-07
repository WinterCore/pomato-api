import {z} from "zod/mod.ts";
import {timerDurationsSchema} from "./timer.ts";

export const settingsSchema = z.strictObject({
    notificationVolume: z.number().min(0).max(1),
    theme: z.enum(["light", "dark"]),
    durations: timerDurationsSchema,
});

export type ISettings = z.infer<typeof settingsSchema>;
