import { createSlice } from '@reduxjs/toolkit'
import { getMySiswa, saveSiswa, updateSiswa } from '../controllers/siswaController'
import { SiswaState } from '../types/SiswaTypes'

const initialState: SiswaState = {
    loading     : false,
    response    : null,
    error       : null,
    detail      : null,
    updateResp  : null,
}

const siswaSlice = createSlice({
    name: 'siswa',
    initialState,
    reducers: {
        resetResponse: (state) => {
            state.response = null
        },
        resetUpdateResp: (state) => {
            state.updateResp = null
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(saveSiswa.pending, (state) => {
            state.loading = true
            state.error   = null
        })
        .addCase(saveSiswa.fulfilled, (state, action) => {
            state.loading  = false
            state.response = action.payload
        })
        .addCase(saveSiswa.rejected, (state) => {
            state.loading = false
            state.error   = 'Gagal mengirim data pendaftaran'
        })

        .addCase(getMySiswa.pending, (state) => {
            state.loading = true
        })
        .addCase(getMySiswa.fulfilled, (state, action) => {
            state.loading = false
            if (action.payload.status === 200) {
                state.detail = action.payload.data
            }
        })
        .addCase(getMySiswa.rejected, (state) => {
            state.loading = false
            state.error   = 'Gagal memuat data siswa'
        })

        .addCase(updateSiswa.pending, (state) => {
            state.loading = true
            state.error   = null
        })
        .addCase(updateSiswa.fulfilled, (state, action) => {
            state.loading    = false
            state.updateResp = action.payload
            if (action.payload.status === 200) {
                state.detail = action.payload.data
            }
        })
        .addCase(updateSiswa.rejected, (state) => {
            state.loading = false
            state.error   = 'Gagal memperbarui data'
        })
    },
})

export const { resetResponse, resetUpdateResp } = siswaSlice.actions
export default siswaSlice.reducer
