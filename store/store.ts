import { configureStore } from "@reduxjs/toolkit"
import siswaSlice from "./slices/siswaSlice"
import authSlice from "./slices/authSlice"

export const store = configureStore({
    reducer: {
        siswa : siswaSlice,
        auth  : authSlice,
    }
})

export type RootState   = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
