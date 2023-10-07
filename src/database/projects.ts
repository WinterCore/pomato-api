import {Bson} from "mongo/mod.ts";
import {DBClient} from "./init.ts";

export interface IProjectSchema {
    readonly _id: Bson.ObjectId;
    readonly name: string;
    readonly estimatedPomodoros: number | null;
    readonly deleted: boolean;
    readonly userId: Bson.ObjectId;
}

export const Project = DBClient.collection<IProjectSchema>("projects");
