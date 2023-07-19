import {verify} from "djwt/mod.ts";
import {Middleware} from "oak/middleware.ts";
import {CONFIG} from "../config.ts";
import {IUserSchema, users} from "../database/users.ts";
import {Bson} from "mongo/mod.ts";
import { Writeable } from "../types/common.ts";

export interface IAuthState {
    readonly userID: string;
}

export interface IFullAuthState extends IAuthState {
    readonly user: IUserSchema;
}

const getUserId = async (authHeader: string | null): Promise<string | null> => {
    if (! authHeader) {
        return null;
    }

    const token = authHeader.slice("Bearer ".length);

    try {
        const { id } = await verify(token, CONFIG.JWT_SECRET, CONFIG.JWT_ALG);
        return id as string;
    } catch (_: unknown) {
        return null;
    }
};

export const authenticated: Middleware<Writeable<IAuthState>> = async (ctx, next) => {
    const authHeader = ctx.request.headers.get("Authorization");

    const userID = await getUserId(authHeader);

    if (! userID) {
        ctx.response.status = 401;
        return;
    }

    ctx.state.userID = userID;

    await next();
};

export const withAuthenticatedUser: Middleware<Writeable<IFullAuthState>> = async (ctx, next) => {
    const authHeader = ctx.request.headers.get("Authorization");
    const userID = await getUserId(authHeader);

    if (! userID) {
        ctx.response.status = 401;
        return;
    }

    const user = await users.findOne({ _id: new Bson.ObjectId(userID) });

    if (! user) {
        ctx.response.status = 401;
        return;
    }

    ctx.state.user = user;

    await next();
};
