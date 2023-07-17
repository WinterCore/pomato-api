import {Application} from "oak/mod.ts";
import {CONFIG} from "./config.ts";
import {AuthRouter} from "./routes/auth.ts";

// Connect to the database
import "./database/init.ts";

const app = new Application();

app.addEventListener("listen", ({ hostname, port, secure }) => {
    console.log(`Listening on: ${secure ? "https://" : "http://"}${hostname ?? "localhost"}:${port}`);
});

const ALLOWED_CORS_ORIGINS = [
    "http://127.0.0.1",
    "http://localhost",
    "http://pomato.app",
    "https://pomato.app",
];

// CORS Middleware
app.use(async (ctx, next) => {
    const origin = ctx.request.headers.get("origin");

    if (origin && ALLOWED_CORS_ORIGINS.find(allowed => origin.startsWith(allowed))) {
        ctx.response.headers.set("Access-Control-Allow-Origin", origin);
        ctx.response.headers.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    }

    if (ctx.request.method === "OPTIONS") {
        ctx.response.status = 200;
        return await next();
    }

    await next();
});

app.use(AuthRouter.routes());

await app.listen({ port: CONFIG.PORT });
