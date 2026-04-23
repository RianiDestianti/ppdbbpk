import { createSlice } from '@reduxjs/toolkit'
import { checkTunggakan } from '../controllers/tunggakanController'
import { TunggakanState } from '../types/TunggakanTypes'

const initialState: TunggakanState = {
    loading  : false,
    response : null,
    error    : null,
}

const tunggakanSlice = createSlice({
    name: 'tunggakan',
    initialState,
    reducers: {
        resetTunggakan: (state) => {
            state.response = null
            state.error    = null
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(checkTunggakan.pending, (state) => {
            state.loading  = true
            state.error    = null
            state.response = null
        })
        .addCase(checkTunggakan.fulfilled, (state, action) => {
            state.loading  = false
            state.response = action.payload
        })
        .addCase(checkTunggakan.rejected, (state) => {
            state.loading = false
            state.error   = 'Gagal menghubungi server untuk pengecekan tunggakan'
        })
    },
})

export const { resetTunggakan } = tunggakanSlice.actions
export default tunggakanSlice.reducer
