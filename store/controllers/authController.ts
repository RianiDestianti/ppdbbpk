import api from "@/services/api";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ChangePasswordRequest, LoginRequest } from "../types/AuthTypes";

export const handleActionLogin = createAsyncThunk('/auth/login', async (payload: LoginRequest) => {
    const response = (await api.post(`/login`, payload)).data;
    return response;
});

export const getProfile = createAsyncThunk('/auth/profile', async () => {
    const response = (await api.get(`/check-auth`)).data;
    return response;
});

export const changePassword = createAsyncThunk('/auth/change-password', async (payload: ChangePasswordRequest) => {
    const response = (await api.put(`/auth/change-password`, payload)).data;
    return response;
});
