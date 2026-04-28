import { createSlice } from '@reduxjs/toolkit'
import { getMySiswa, getMySiswaList, saveSiswa, updateSiswa } from '../controllers/siswaController'
import { SiswaState } from '../types/SiswaTypes'

const initialState: SiswaState = {
    loading     : false,
    response    : null,
    error       : null,
    detail      : null,
    list        : [],
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

        .addCase(getMySiswaList.pending, (state) => {
            state.loading = true
        })
        .addCase(getMySiswaList.fulfilled, (state, action) => {
            state.loading = false
            if (action.payload.status === 200) {
                state.list = Array.isArray(action.payload.data) ? action.payload.data : []
            }
        })
        .addCase(getMySiswaList.rejected, (state) => {
            state.loading = false
            state.list    = []
            state.error   = 'Gagal memuat daftar pendaftaran'
        })
    },
})

export const { resetResponse, resetUpdateResp } = siswaSlice.actions
export default siswaSlice.reducer
