export interface TunggakanPayload {
    noSpb : string;
}

export interface TunggakanData {
    nospb         : string;
    nama          : string;
    asalSekolah  ?: string;
    kelas        ?: string;
    status       ?: number | string;
    tunggakan     : string;
    keterangan   ?: string;
}

export interface TunggakanResponse {
    status   : number;
    message ?: string;
    data    ?: TunggakanData;
}

export interface TunggakanState {
    loading  : boolean;
    response : TunggakanResponse | null;
    error    : string | null;
}
