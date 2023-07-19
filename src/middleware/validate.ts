import { Middleware } from "oak/middleware.ts";
import {z} from "zod/mod.ts";

export type BodyState<T> = { body: T };
export type BodyStateFromSchema<T extends z.ZodType> = BodyState<z.infer<T>>;

export const validate = <T extends z.ZodType>(schema: T): Middleware<BodyState<z.infer<T>>> => async (ctx, next) => {
    try {
        const body = await ctx.request.body({ type: "json" }).value;
        await schema.parseAsync(body);
        ctx.state.body = body;
        await next();
    } catch (e) {
        const { issues } = e as z.ZodError;

        ctx.response.status = 400;
        ctx.response.body = {
            message: "Invalid request",
            issues,
        };
    }
};
