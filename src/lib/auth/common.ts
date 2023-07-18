export interface IOAuthUserData {
    readonly id: string;
    readonly email: string;
    readonly name: string;
    readonly profile_picture_url: string;
}

export interface IOAuthProvider {
    readonly getAuthURL: () => string;
    readonly getData: (authCode: string) => Promise<IOAuthUserData>;
}

export type AuthProvider = "google";
