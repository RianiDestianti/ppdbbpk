export interface ResponseLoginType {
    key         : string;
    username    : string;
    nama        : string;
}

export interface GoogleChild {
    noreg : string;
    nama  : string;
}

export interface GoogleSelectionData {
    requires_selection : true;
    google_session     : string;
    children           : GoogleChild[];
}

export interface SelectGoogleChildPayload {
    google_session : string;
    noreg          : string;
}

export interface AddGoogleChildPayload {
    google_session : string;
    nama           : string;
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
