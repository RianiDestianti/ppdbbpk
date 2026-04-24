export interface LoginRequest {
    username    : string;
    password    : string;
}

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

export interface ChangePasswordRequest {
    password_lama        : string;
    password_baru        : string;
    konfirmasi_password  : string;
}

export interface ChangePasswordResponse {
    status  : number;
    message : string;
    data?   : Record<string, string[]>;
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
