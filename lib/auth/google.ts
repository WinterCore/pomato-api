import {IOAuthProvider, IOAuthUserData} from "./common.ts";
import {CONFIG} from "../../config.ts";

const CONSENT_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const EXCHANGE_ENDPOINT = "https://oauth2.googleapis.com/token";
const USER_INFO_ENDPOINT = "https://www.googleapis.com/userinfo/v2/me";

const REDIRECT_URI = new URL("/auth/google/callback", CONFIG.API_DOMAIN).toString();

const SCOPES = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
];

interface IAccessTokenResp {
    readonly access_token: string;
    readonly expires_in: number;
    readonly scope: string;
    readonly id_token: string;
    readonly token_type: "Bearer";
}

interface IUserInfoResp {
    readonly id: string;
    readonly name: string;
    readonly picture: string;
    readonly email: string;
    readonly locale: string;
    readonly given_name: string;
    readonly verified_email: boolean;
}

export class GoogleAuth implements IOAuthProvider {
    getAuthURL(): string {
        const url = new URL(CONSENT_ENDPOINT);
        url.searchParams.set("client_id", CONFIG.GOOGLE_CLIENT_ID);
        url.searchParams.set("redirect_uri", REDIRECT_URI);
        url.searchParams.set("response_type", "code");
        url.searchParams.set("scope", SCOPES.join(" "));

        return url.toString();
    }


    async getData(authCode: string): Promise<IOAuthUserData> {
        const { access_token } = await this.getAccessToken(authCode);

        const url = new URL(USER_INFO_ENDPOINT);
        const resp = await fetch(url, { headers: { Authorization: `Bearer ${access_token}` } });

        if (resp.status >= 300) {
            throw new Error(`Something happened while fetching user data ${JSON.stringify(await resp.json())}`);
        }

        const { email, name, id, picture } = await resp.json() as IUserInfoResp;

        return {
            email,
            name,
            id,
            profile_picture_url: picture,
        };
    }

    private async getAccessToken(authCode: string): Promise<IAccessTokenResp> {
        const url = new URL(EXCHANGE_ENDPOINT);
        url.searchParams.set("client_id", CONFIG.GOOGLE_CLIENT_ID);
        url.searchParams.set("client_secret", CONFIG.GOOGLE_CLIENT_SECRET);
        url.searchParams.set("redirect_uri", REDIRECT_URI);
        url.searchParams.set("grant_type", "authorization_code");
        url.searchParams.set("code", authCode);

        const resp = await fetch(url, { method: "POST" });
        
        if (resp.status >= 300) {
            throw new Error(`Something happened while getting google access token ${JSON.stringify(await resp.json())}`);
        }

        return await resp.json() as IAccessTokenResp;
    }
}
