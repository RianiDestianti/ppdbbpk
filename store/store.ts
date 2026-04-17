import { configureStore } from "@reduxjs/toolkit"
import siswaSlice from "./slices/siswaSlice"

export const store = configureStore({
    reducer: {
        siswa : siswaSlice,
    }
})

export type RootState  = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
