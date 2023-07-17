import {verify} from "djwt/mod.ts";
import {Middleware} from "oak/middleware.ts";
import {CONFIG} from "../config.ts";
import {IUserSchema, users} from "../database/users.ts";
import {Writeable} from "@shared/types.ts";
import {Bson} from "mongo/mod.ts";

export interface IAuthState {
    readonly userID: string;
}

export interface IFullAuthState extends IAuthState {
    readonly user: IUserSchema;
}

export const authenticated: Middleware<Writeable<IAuthState>> = async (ctx, next) => {
    const authHeader = ctx.request.headers.get("Authorization");

    if (! authHeader) {
        ctx.response.status = 401;
        return;
    }

    const token = authHeader.slice("Bearer ".length);

    let userID: string;

    try {
        const { id } = await verify(token, CONFIG.JWT_SECRET, CONFIG.JWT_ALG);
        userID = id as string;
    } catch (_: unknown) {
        ctx.response.status = 401;
        return;
    }

    ctx.state.userID = userID;

    await next();
};

export const withAuthenticatedUser: Middleware<Writeable<IFullAuthState>> = async (ctx, next) => {
    await authenticated(ctx, async () => {});
    const { userID } = ctx.state;

    const user = await users.findOne({ _id: new Bson.ObjectId(userID) });
    ctx.state.user = user!;

    await next();
};
