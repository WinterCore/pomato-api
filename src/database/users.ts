import {Bson} from "mongo/mod.ts";
import {AuthProvider, IOAuthUserData} from "../lib/auth/common.ts";
import {DBClient} from "./init.ts";
import {ISettings} from "@shared/settings.ts";

export interface IUserSchema extends Omit<IOAuthUserData, "id"> {
    readonly _id: Bson.ObjectId;
    readonly providerID: string;
    readonly provider: AuthProvider;
    readonly settings: ISettings;
}

export const users = DBClient.collection<IUserSchema>("users");
