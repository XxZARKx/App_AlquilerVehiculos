import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthenticatedUser } from "../provider/user/getAuthUser";
import { getReservationsByUserId } from "../provider/reservation/getReservationUser";
import { getVehicleById } from "../provider/vehicle/getVehicleById";
import { supabase } from "../../api/supabaseClient";
import { getSucursalById } from "../provider/reservation/getSucursalById";
import Header from "./Header";
import Footer from "./Footer";
import Swal from "sweetalert2";

const MisReservas = () => {
  const [userId, setUserId] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getAuthenticatedUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error("Error al obtener el usuario autenticado:", error);
      }
    };
    fetchUser();
  }, []);

  const {
    data: reservations,
    isLoading: loadingReservations,
    error: reservationsError,
  } = useQuery({
    queryKey: ["reservations", userId],
    queryFn: () => getReservationsByUserId(userId),
    enabled: !!userId,
  });

  const fetchVehicleData = async (reservations) => {
    const vehicleDataPromises = reservations.map((reservation) =>
      getVehicleById(reservation.vehiculo_id)
    );
    return Promise.all(vehicleDataPromises);
  };

  const fetchSucursalData = async (reservations) => {
    return Promise.all(
      reservations.map((reservation) =>
        getSucursalById(reservation.sucursal_id)
      )
    );
  };
  const {
    data: vehicles,
    isLoading: loadingVehicles,
    error: vehiclesError,
  } = useQuery({
    queryKey: ["vehicles", reservations],
    queryFn: () => fetchVehicleData(reservations),
    enabled: !!reservations && reservations.length > 0,
  });

  const { data: sucursales, isLoading: loadingSucursales } = useQuery({
    queryKey: ["sucursales", reservations],
    queryFn: () => fetchSucursalData(reservations),
    enabled: !!reservations && reservations.length > 0,
  });

  const cancelReservationMutation = useMutation({
    mutationFn: async (reservationId) => {
      await supabase.from("reserva").delete().eq("id", reservationId);
      const reservation = reservations.find((res) => res.id === reservationId);
      await supabase
        .from("vehiculo")
        .update({ estado: "Disponible" })
        .eq("id", reservation.vehiculo_id);
      return reservationId;
    },
    onSuccess: (reservationId) => {
      queryClient.invalidateQueries(["reservations", userId]);
      queryClient.invalidateQueries(["vehicles", reservations]); // 💡 Agregar esto
      queryClient.invalidateQueries(["sucursales", reservations]); // 💡 Agregar esto

      Swal.fire({
        icon: "success",
        title: "Reserva cancelada",
        text: "La reserva se ha cancelado exitosamente.",
      });
    },

    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al cancelar la reserva: " + error.message,
      });
    },
  });

  const handleCancelReservation = (reservationId) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Quieres cancelar esta reserva?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No, mantener reserva",
    }).then((result) => {
      if (result.isConfirmed) {
        cancelReservationMutation.mutate(reservationId);
      }
    });
  };

  useEffect(() => {
    if (
      !loadingReservations &&
      !loadingVehicles &&
      reservations !== undefined &&
      vehicles !== undefined
    ) {
      setIsDataLoaded(true);
    }
  }, [loadingReservations, loadingVehicles, reservations, vehicles]);

  if (!isDataLoaded) {
    return <div>Cargando reservas...</div>;
  }

  if (reservationsError || vehiclesError) {
    return (
      <div>
        Error al cargar los datos:{" "}
        {reservationsError?.message || vehiclesError?.message}
      </div>
    );
  }

  if (!reservations || reservations.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            No tienes reservas realizadas
          </h2>
          <p className="text-gray-500 mt-2">
            Actualmente no tienes ninguna reserva registrada. ¿Te gustaría hacer
            una nueva?
          </p>
          <div className="mt-4">
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => (window.location.href = "/vehicles")} // Cambia la URL por la correspondiente
            >
              Hacer una nueva reserva
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Mis Reservas</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map((reservation, index) => {
            // Verifica que vehicles y sucursales no sean undefined y tengan la longitud esperada
            const vehicle =
              vehicles && vehicles.length > index ? vehicles[index] : null;
            const sucursal =
              sucursales && sucursales.length > index
                ? sucursales[index]
                : null;

            if (!vehicle) {
              return null; // O puedes renderizar un mensaje de error o un componente de carga
            }

            const fechaReserva = new Date(reservation.fecha_reserva);
            const fechaDevolucion = new Date(fechaReserva);
            fechaDevolucion.setDate(fechaReserva.getDate() + reservation.dias);

            return (
              <div
                key={reservation.id}
                className="border rounded-lg p-4 shadow-md bg-white"
              >
                <img
                  src={vehicle.imagen_url}
                  alt={`${vehicle.marca} ${vehicle.modelo}`}
                  className="w-full h-40 object-contain rounded-md mb-4"
                />
                <h2 className="text-lg font-bold mb-2">
                  {vehicle.marca} {vehicle.modelo}
                </h2>
                <p>
                  <strong>Matricula:</strong> {vehicle.matricula}
                </p>
                <p>
                  <strong>Categoría:</strong> {vehicle.categoria}
                </p>
                <p>
                  <strong>Días reservados:</strong> {reservation.dias}
                </p>
                <p>
                  <strong>Precio por día:</strong> S/ {vehicle.precio}
                </p>
                <p>
                  <strong>Total:</strong> S/ {reservation.total}
                </p>
                <p>
                  <strong>Fecha de reserva:</strong>{" "}
                  {fechaReserva.toLocaleDateString()}
                </p>
                <p>
                  <strong>Fecha de devolución:</strong>{" "}
                  {fechaDevolucion.toLocaleDateString()}
                </p>
                <p>
                  <strong>Sucursal:</strong>{" "}
                  {sucursal ? sucursal.nombre_sucursal : "No especificada"}
                </p>

                <button
                  onClick={() => handleCancelReservation(reservation.id)}
                  className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                  Cancelar Reserva
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MisReservas;
