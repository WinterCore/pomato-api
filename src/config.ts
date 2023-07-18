import {config} from "dotenv/mod.ts";

const env = config({ safe: true });

export const CONFIG = {
    PORT: +(env.PORT || "8081"),
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
    JWT_SECRET: env.JWT_SECRET,
    FRONTEND_DOMAIN: env.FRONTEND_DOMAIN,
    API_DOMAIN: env.API_DOMAIN,
    MONGO_URL: env.MONGO_URL,
    JWT_ALG: "HS512" as const,
};
