import { supabase } from "../../../api/supabaseClient";

export const getReservationsByUserId = async (userId) => {
	const { data, error } = await supabase
		.from("reserva")
		.select("*")
		.eq("usuario_id", userId); // Filtrar por el ID del usuario

	if (error) {
		throw new Error(error.message);
	}

	return data;
};

