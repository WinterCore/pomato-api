import {Router} from "oak/mod.ts";
import {GoogleAuth} from "../lib/auth/google.ts";
import {users, IUserSchema} from "../database/users.ts";
import * as djwt from "djwt/mod.ts";
import {CONFIG} from "../config.ts";
import {IFullAuthState, withAuthenticatedUser} from "../middleware/authenticated.ts";

const googleAuthenticator = new GoogleAuth();

export const AuthRouter = new Router();

AuthRouter.get("/auth/google", (ctx) => {
    const url = googleAuthenticator.getAuthURL();
    ctx.response.body = { url };
});

AuthRouter.get("/auth/google/callback", async (ctx) => {
    const { search } = ctx.request.url;
    const query = new URLSearchParams(search);
    const code = query.get("code");

    if (! code) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Missing auth code" };
        return;
    }

    const { id: _, ...data } = await googleAuthenticator.getData(code);

    await users.updateOne(
        { email: data.email },
        { $set: { ...data } },
        { upsert: true },
    );

    const { _id } = await users.findOne({ email: data.email }) as IUserSchema;

    const token = await djwt.create(
        { alg: CONFIG.JWT_ALG },
        { id: _id.toString() },
        CONFIG.JWT_SECRET,
    );

    const redirectURL = new URL("/auth", CONFIG.FRONTEND_DOMAIN);
    redirectURL.searchParams.set("token", token);

    ctx.response.redirect(redirectURL.toString());
});

AuthRouter.get<"/me", never, IFullAuthState>("/me", withAuthenticatedUser, (ctx) => {
    const user = ctx.state.user;

    const resp = {
        id: user._id,
        name: user.name,
        email: user.email,
        settings: user.settings,
        profile_picture_url: user.profile_picture_url,
    };

    ctx.response.body = resp;
});
