import {Router} from "oak/mod.ts";
import {IFullAuthState, withAuthenticatedUser} from "../middleware/authenticated.ts";

export const SettingsRouter = new Router<IFullAuthState>();

SettingsRouter.use(withAuthenticatedUser);

SettingsRouter.get("/settings", (ctx) => {
    ctx.response.body = { data: ctx.state.user.settings };
});
