import {Bson} from "mongo/mod.ts";
import {z} from "zod/mod.ts";

export type Writeable<T> = { -readonly [P in keyof T]: T[P] };



export const objectId = z
    .string()
    .refine(
        val => Bson.ObjectId.isValid(val),
        { message: "String must be a valid ObjectId" },
    );
