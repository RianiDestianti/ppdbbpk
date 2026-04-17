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
