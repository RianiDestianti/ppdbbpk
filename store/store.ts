import { configureStore } from "@reduxjs/toolkit"
import siswaSlice from "./slices/siswaSlice"
import authSlice from "./slices/authSlice"
import tunggakanSlice from "./slices/tunggakanSlice"
import konfirmasiSlice from "./slices/konfirmasiSlice"
import sekolahSlice from "./slices/sekolahSlice"

export const store = configureStore({
    reducer: {
        siswa     : siswaSlice,
        auth      : authSlice,
        tunggakan : tunggakanSlice,
        konfirmasi: konfirmasiSlice,
        sekolah   : sekolahSlice,
    }
})

export type RootState   = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
