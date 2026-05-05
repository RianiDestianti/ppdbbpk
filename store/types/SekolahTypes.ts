export interface SekolahOption {
    id       : number;
    kode     : string;
    nama     : string;
    jenjang  : string;
    programs : string[];
}

export interface SekolahListPayload {
    jenjang : string;
}

export interface SekolahListResponse {
    status   : number;
    message ?: string;
    data    ?: SekolahOption[];
}

export interface SekolahState {
    loading   : boolean;
    byJenjang : Record<string, SekolahOption[]>;
    error     : string | null;
}
