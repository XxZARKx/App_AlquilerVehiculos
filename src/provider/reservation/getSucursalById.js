import { supabase } from "../../../api/supabaseClient";

export const getSucursalById = async (sucursalId) => {
    if (!sucursalId) return null;
  
    const { data, error } = await supabase
      .from("sucursal")
      .select("id, nombre_sucursal")
      .eq("id", sucursalId)
      .single(); 
  
    if (error) {
      console.error(`Error al obtener sucursal con id ${sucursalId}:`, error);
      return null;
    }
  
    return data;
  };
  