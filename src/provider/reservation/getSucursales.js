import { supabase } from "../../../api/supabaseClient";

export const getSucursales = async () => {
    try {
        const { data, error } = await supabase.from("sucursal").select("*");
        if (error) {
            throw new Error(error.message); 
        }
        console.log(data)
        return data;
    } catch (err) {
        throw new Error(err.message);
    }
};
