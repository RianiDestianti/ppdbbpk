import { createSlice } from '@reduxjs/toolkit'
import { getSekolahByJenjang } from '../controllers/sekolahController'
import { SekolahState } from '../types/SekolahTypes'

const initialState: SekolahState = {
    loading   : false,
    byJenjang : {},
    error     : null,
}

const sekolahSlice = createSlice({
    name: 'sekolah',
    initialState,
    reducers: {
        resetSekolah: (state) => {
            state.byJenjang = {}
            state.error     = null
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(getSekolahByJenjang.pending, (state) => {
            state.loading = true
            state.error   = null
        })
        .addCase(getSekolahByJenjang.fulfilled, (state, action) => {
            state.loading = false
            const jenjang = action.meta.arg.jenjang
            if (action.payload.status === 200) {
                state.byJenjang[jenjang] = action.payload.data ?? []
            }
        })
        .addCase(getSekolahByJenjang.rejected, (state, action) => {
            state.loading = false
            const jenjang = action.meta.arg.jenjang
            state.byJenjang[jenjang] = []
            state.error              = 'Gagal memuat daftar sekolah'
        })
    },
})

export const { resetSekolah } = sekolahSlice.actions
export default sekolahSlice.reducer
