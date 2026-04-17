import { createSlice } from '@reduxjs/toolkit'
import { saveSiswa } from '../controllers/siswaController'
import { SiswaState } from '../types/SiswaTypes'

const initialState: SiswaState = {
    loading     : false,
    response    : null,
    error       : null,
}

const siswaSlice = createSlice({
    name: 'siswa',
    initialState,
    reducers: {
        resetResponse: (state) => {
            state.response = null
        }
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
    },
})

export const { resetResponse } = siswaSlice.actions
export default siswaSlice.reducer
