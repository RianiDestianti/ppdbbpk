import { ChangeEvent } from "react";

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

export const handleChangeInput = <T extends Record<string, any>>(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    setValue: SetState<T>
) => {
    const { name, value } = e.target;

    setValue(prevState => ({
        ...prevState,
        [name]: value
    }));
};

export const formatRupiah = (value?: string | number | null): string => {
    const n = typeof value === "number" ? value : Number(String(value ?? "").replace(/[^\d]/g, ""));
    if (!Number.isFinite(n) || n <= 0) return "0";
    return new Intl.NumberFormat("id-ID").format(n);
};
