import {z} from "zod/mod.ts";
import {IProjectSchema} from "../database/projects.ts";

export const projectSchema = z.strictObject({
    name: z.string(),
    estimatedPomodoros: z.number().min(1).nullable(),
});

export type IProject = z.infer<typeof projectSchema> & { id: string };


export const toProject = (projectSchema: IProjectSchema): IProject => ({
    id: projectSchema._id.toString(),
    name: projectSchema.name,
    estimatedPomodoros: projectSchema.estimatedPomodoros,
});
