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
