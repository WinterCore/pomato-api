import { Middleware } from "oak/middleware.ts";
import {z} from "zod/mod.ts";

export const validate = (schema: z.AnyZodObject): Middleware => async (ctx, next) => {
    try {
        await schema.parseAsync(ctx.request.body({ type: "json" }));
        next();
    } catch (e) {
        const { issues } = e as z.ZodError;

        ctx.response.status = 400;
        ctx.response.body = {
            message: "Invalid request",
            issues,
        };
    }
};
