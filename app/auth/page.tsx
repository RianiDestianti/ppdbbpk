"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { handleGoogleLogin } from "@/store/controllers/authController";
import { handleCleanResponse } from "@/store/slices/authSlice";
import Swal from "sweetalert2";

function GoogleCallback() {
    const router          = useRouter();
    const searchParams    = useSearchParams();
    const dispatch        = useAppDispatch();
    const stateLogin      = useAppSelector((state) => state.auth);
    const requestedRef    = useRef(false);

    useEffect(() => {
        const code  = searchParams.get("code");
        const error = searchParams.get("error");

        if (error) {
            Swal.fire({
                icon              : "error",
                title             : "Login Google Gagal",
                text              : error,
                confirmButtonColor: "#dc2626",
            }).then(() => {
                router.replace("/sign-in");
            });
            return;
        }

        if (!code) {
            router.replace("/sign-in");
            return;
        }

        if (requestedRef.current) return;
        requestedRef.current = true;

        dispatch(handleGoogleLogin({
            code         : code,
            redirect_uri : `${window.location.origin}/auth`,
        }));
    }, [dispatch, router, searchParams]);

    useEffect(() => {
        if (stateLogin.responseLogin) {
            localStorage.setItem("auth-key",      stateLogin.responseLogin.key);
            localStorage.setItem("auth-username", stateLogin.responseLogin.username);
            localStorage.setItem("auth-nama",     stateLogin.responseLogin.nama);

            Swal.fire({
                icon              : "success",
                title             : "Login Berhasil",
                text              : `Selamat datang, ${stateLogin.responseLogin.nama}`,
                confirmButtonColor: "#dc2626",
                timer             : 1500,
                showConfirmButton : false,
            }).then(() => {
                dispatch(handleCleanResponse());
                window.location.href = "/dashboard";
            });
        }
    }, [stateLogin.responseLogin, dispatch]);

    useEffect(() => {
        if (stateLogin.error) {
            Swal.fire({
                icon              : "error",
                title             : "Login Google Gagal",
                text              : stateLogin.error,
                confirmButtonColor: "#dc2626",
            }).then(() => {
                dispatch(handleCleanResponse());
                router.replace("/sign-in");
            });
        }
    }, [stateLogin.error, dispatch, router]);

    return (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-[#1976d2] to-[#1565c0] py-20">
            <div className="bg-white rounded-2xl shadow-2xl px-10 py-12 text-center max-w-md">
                <div className="w-12 h-12 border-4 border-[#1976d2] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h1 className="text-xl font-semibold text-gray-800 mb-1">Memproses Login Google</h1>
                <p className="text-sm text-gray-500">Mohon tunggu, sedang memverifikasi akun Anda...</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div className="flex-1" />}>
            <GoogleCallback />
        </Suspense>
    );
}
