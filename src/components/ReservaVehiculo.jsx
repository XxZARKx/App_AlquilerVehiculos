// import React, { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { getAuthenticatedUser } from "../provider/user/getAuthUser";
// import { createReservation } from "../provider/reservation/createReservation";
// import { getVehicleById } from "../provider/vehicle/getVehicleById";
// import { getSucursales } from "../provider/reservation/getSucursales";
// import { updateVehicleStatus } from "../provider/reservation/updateVehicleStatus";
// import Swal from "sweetalert2";

// const ReservaVehiculo = () => {
//   const { id: vehicleId } = useParams();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [days, setDays] = useState(1);

//   const {
//     data: vehicle,
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ["vehicle", vehicleId],
//     queryFn: () => getVehicleById(vehicleId),
//     enabled: !!vehicleId,
//   });

//   const createReservationMutation = useMutation({
//     mutationFn: createReservation,
//     onSuccess: (data) => {
//       console.log("reserva exitosa");
//     },
//     onError: (error) => {
//       console.error("Error al realizar la reserva:", error);
//       Swal.fire("Error", "Error al realizar la reserva.", "error");
//     },
//   });

//   const handleReservation = async () => {
//     setLoading(true);

//     try {
//       const user = await getAuthenticatedUser();
//       if (!user) {
//         Swal.fire(
//           "Error",
//           "Por favor, inicia sesión para realizar una reserva.",
//           "warning"
//         );
//         setLoading(false);
//         return;
//       }

//       const userId = user.id;
//       const vehicleIdInt = vehicle.id;

//       const reservation = {
//         vehiculo_id: vehicleIdInt,
//         usuario_id: userId,
//         dias: days,
//         total: vehicle.precio * days,
//       };

//       await createReservationMutation.mutateAsync(reservation);

//       await updateVehicleStatus({ id: vehicleIdInt, status: "Reservado" });

//       Swal.fire("Éxito", "Reserva realizada con éxito.", "success");
//       window.location.href = "/vehicles";
//     } catch (error) {
//       console.error("Error al realizar la reserva:", error);
//       Swal.fire("Error", "Error al realizar la reserva.", "error");
//     }

//     setLoading(false);
//   };

//   if (isLoading) {
//     return <div>Cargando...</div>;
//   }

//   if (error || !vehicle) {
//     return <div>Error al obtener los datos del vehículo.</div>;
//   }

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen">
//       <h1 className="text-2xl font-bold mb-6">Reservar Vehículo</h1>
//       <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md space-y-4">
//         <div className="text-center">
//           <img
//             className="w-full h-64 object-contain rounded-lg"
//             src={vehicle.imagen_url}
//             alt={`${vehicle.marca} ${vehicle.modelo}`}
//           />
//         </div>
//         <div className="text-lg">
//           <p>
//             <strong>Marca:</strong> {vehicle.marca}
//           </p>
//           <p>
//             <strong>Modelo:</strong> {vehicle.modelo}
//           </p>
//           <p>
//             <strong>Matrícula:</strong> {vehicle.matricula}
//           </p>
//           <p>
//             <strong>Precio por día:</strong> S/ {vehicle.precio}
//           </p>
//         </div>
//         <div>
//           <label htmlFor="days" className="block text-sm font-medium mb-2">
//             Días de reserva:
//           </label>
//           <input
//             id="days"
//             type="number"
//             min="1"
//             value={days}
//             onChange={(e) => setDays(e.target.value)}
//             className="w-full border rounded px-3 py-2"
//           />
//         </div>
//         <div className="text-lg">
//           <p>
//             <strong>Total estimado:</strong> S/ {vehicle.precio * days}
//           </p>
//         </div>
//         <div className="flex gap-4">
//           <button
//             onClick={handleReservation}
//             disabled={loading}
//             className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
//           >
//             {loading ? "Reservando..." : "Confirmar"}
//           </button>
//           <button
//             onClick={() => navigate(-1)}
//             className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
//           >
//             Cancelar
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReservaVehiculo;
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAuthenticatedUser } from "../provider/user/getAuthUser";
import { createReservation } from "../provider/reservation/createReservation";
import { getVehicleById } from "../provider/vehicle/getVehicleById";
import { getSucursales } from "../provider/reservation/getSucursales";
import { updateVehicleStatus } from "../provider/reservation/updateVehicleStatus";
import Header from "./Header";
import Footer from "./Footer";
import Swal from "sweetalert2";

const ReservaVehiculo = () => {
  const { id: vehicleId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(1);
  const [selectedSucursal, setSelectedSucursal] = useState("");

  const {
    data: vehicle,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: () => getVehicleById(vehicleId),
    enabled: !!vehicleId,
  });

  const { data: sucursales } = useQuery({
    queryKey: ["sucursales"],
    queryFn: getSucursales,
  });

  console.log(sucursales);

  const createReservationMutation = useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      console.log("reserva exitosa");
    },
    onError: () => {
      Swal.fire("Error", "Error al realizar la reserva.", "error");
    },
  });

  const handleReservation = async () => {
    setLoading(true);

    try {
      const user = await getAuthenticatedUser();
      if (!user) {
        Swal.fire(
          "Error",
          "Por favor, inicia sesión para reservar.",
          "warning"
        );
        setLoading(false);
        return;
      }

      if (!selectedSucursal) {
        Swal.fire("Error", "Selecciona una sucursal.", "warning");
        setLoading(false);
        return;
      }

      const reservation = {
        vehiculo_id: vehicle.id,
        usuario_id: user.id,
        dias: days,
        total: vehicle.precio * days,
        sucursal_id: selectedSucursal,
      };

      await createReservationMutation.mutateAsync(reservation);
      await updateVehicleStatus({ id: vehicle.id, status: "Reservado" });

      Swal.fire("Éxito", "Reserva realizada con éxito.", "success");
      window.location.href = "/vehicles";
    } catch (error) {
      Swal.fire("Error", "Error al realizar la reserva.", "error");
    }

    setLoading(false);
  };

  if (isLoading) return <div>Cargando...</div>;
  if (error || !vehicle)
    return <div>Error al obtener los datos del vehículo.</div>;

  return (
    <div>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen py-24">
        <h1 className="text-2xl font-bold mb-6">Reservar Vehículo</h1>
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="text-center">
            <img
              className="w-full h-64 object-contain rounded-lg"
              src={vehicle.imagen_url}
              alt={`${vehicle.marca} ${vehicle.modelo}`}
            />
          </div>
          <div className="text-lg">
            <p>
              <strong>Marca:</strong> {vehicle.marca}
            </p>
            <p>
              <strong>Modelo:</strong> {vehicle.modelo}
            </p>
            <p>
              <strong>Matrícula:</strong> {vehicle.matricula}
            </p>
            <p>
              <strong>Precio por día:</strong> S/ {vehicle.precio}
            </p>
          </div>
          <div>
            <label htmlFor="days" className="block text-sm font-medium mb-2">
              Días de reserva:
            </label>
            <input
              id="days"
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="sucursal"
              className="block text-sm font-medium mb-2"
            >
              Selecciona una sucursal:
            </label>
            <select
              id="sucursal"
              value={selectedSucursal}
              onChange={(e) => setSelectedSucursal(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Selecciona una opción</option>
              {sucursales?.map((sucursal) => (
                <option key={sucursal.id} value={sucursal.id}>
                  {sucursal.nombre_sucursal}
                </option>
              ))}
            </select>
          </div>
          <div className="text-lg">
            <p>
              <strong>Total estimado:</strong> S/ {vehicle.precio * days}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleReservation}
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              {loading ? "Reservando..." : "Confirmar"}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ReservaVehiculo;
