import { supabase } from "../../../api/supabaseClient";

export const getReservations = async () => {
	try {
		const { data, error } = await supabase.from("reserva").select("*");
		if (error) {
			throw new Error(error.message); 
		}
		return data;
	} catch (err) {
		
		throw new Error(err.message);
	}
};
