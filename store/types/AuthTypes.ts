export interface ResponseLoginType {
    key         : string;
    username    : string;
    nama        : string;
}

export interface DataAuthType {
    noreg       : string;
    nama        : string;
    email       : string;
    no_va       : string;
    pilihan1    : string;
    pilihan2    : string;
}

export interface GoogleLoginRequest {
    code          : string;
    redirect_uri? : string;
}

export interface GoogleLoginResponse {
    status   : number;
    message  : string;
    data?    : ResponseLoginType;
}

export interface SignaturePayload {
    signature : string;
}

export interface SignatureData {
    social_id ?: string;
    signature ?: string | null;
}
