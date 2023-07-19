import {Router} from "oak/mod.ts";
import {IAuthState, authenticated} from "../middleware/authenticated.ts";
import {z} from "zod/mod.ts";
import {settingsSchema} from "../types/user.ts";
import {BodyStateFromSchema, validate} from "../middleware/validate.ts";
import {users} from "../database/users.ts";
import {Bson} from "mongo/mod.ts";

type IRouterState = IAuthState;
export const SettingsRouter = new Router<IRouterState>();
SettingsRouter.use(authenticated);

const updateSettingsSchema = z.strictObject({ settings: settingsSchema });
SettingsRouter.put<"/settings", never, BodyStateFromSchema<typeof updateSettingsSchema> & IRouterState>("/settings", validate(updateSettingsSchema), async (ctx) => {
    await users.updateOne(
        { _id: new Bson.ObjectId(ctx.state.userID) },
        { $set: { settings: ctx.state.body.settings } },
    );

    ctx.response.body = { message: "Success!" };
});
