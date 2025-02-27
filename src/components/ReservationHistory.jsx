import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReservations } from "../provider/reservation/getReservations";
import { getAuthUserById } from "../provider/user/getAuthUserById";
import { getUserByEmail } from "../provider/user/getUserByEmail";
import { getVehicleById } from "../provider/vehicle/getVehicleById";
import { supabase } from "../../api/supabaseClient";
import Swal from "sweetalert2";

const ReservationHistory = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const queryClient = useQueryClient();

  const {
    data: reservations,
    isLoading: loadingReservations,
    error: reservationError,
  } = useQuery({
    queryKey: ["reservations"],
    queryFn: getReservations,
  });

  const {
    data: usersData,
    isLoading: loadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["usersWithReservations"],
    queryFn: async () => {
      if (!reservations) return [];

      // Obtener datos de cada usuario
      const users = await Promise.all(
        reservations.map(async (reservation) => {
          const user = await getAuthUserById(reservation.usuario_id);
          const userEmailData = await getUserByEmail(
            user?.user?.user_metadata?.email
          );
          return {
            id: reservation.usuario_id,
            nombre: userEmailData?.nombre,
            apellido: userEmailData?.apellido,
          };
        })
      );

      const uniqueUsers = Array.from(new Set(users.map((user) => user.id))).map(
        (id) => users.find((user) => user.id === id)
      );

      return uniqueUsers;
    },
    enabled: !!reservations,
  });

  const cancelReservationMutation = useMutation({
    mutationFn: async (reservationId) => {
      const reservation = reservations.find((res) => res.id === reservationId);

      await supabase.from("reserva").delete().eq("id", reservationId);

      await supabase
        .from("vehiculo")
        .update({ estado: "Disponible" })
        .eq("id", reservation.vehiculo_id);

      return reservationId;
    },
    onSuccess: (reservationId) => {
      queryClient.invalidateQueries(["reservations"]);
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

  if (loadingReservations || loadingUsers) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-lg text-gray-700">Cargando reservas...</span>
      </div>
    );
  }

  if (reservationError || usersError) {
    return (
      <div className="p-4">
        <p className="text-red-500">
          Error al cargar los datos:{" "}
          {reservationError?.message || usersError?.message}
        </p>
      </div>
    );
  }

  const reservationsByUser = reservations.reduce((acc, reservation) => {
    const userId = reservation.usuario_id;
    if (!acc[userId]) {
      acc[userId] = [];
    }
    acc[userId].push(reservation);
    return acc;
  }, {});

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold text-blue-600 mb-6">
        Historial de Reservas
      </h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Seleccione un usuario
        </h2>
        <select
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        >
          <option value="">Seleccione un usuario</option>
          {usersData?.map((user) => (
            <option key={user.id} value={user.id}>
              {user.nombre} {user.apellido}
            </option>
          ))}
        </select>
      </div>

      {selectedUserId && (
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Reservas de{" "}
            {usersData.find((user) => user.id === selectedUserId)?.nombre}{" "}
            {usersData.find((user) => user.id === selectedUserId)?.apellido}
          </h2>
          {reservationsByUser[selectedUserId]?.length > 0 ? (
            <ul className="space-y-4">
              {reservationsByUser[selectedUserId].map((reservation) => (
                <ReservationItem
                  key={reservation.id}
                  reservation={reservation}
                  onCancelReservation={handleCancelReservation}
                />
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Este usuario no tiene reservas.</p>
          )}
        </div>
      )}
    </div>
  );
};

const ReservationItem = ({ reservation, onCancelReservation }) => {
  const {
    data: user,
    isLoading: loadingUser,
    error: userError,
  } = useQuery({
    queryKey: ["user", reservation?.usuario_id],
    queryFn: () => getAuthUserById(reservation?.usuario_id),
    enabled: !!reservation?.usuario_id,
  });

  const {
    data: userEmailData,
    isLoading: loadingUserEmail,
    error: userEmailError,
  } = useQuery({
    queryKey: ["userByEmail", user?.user?.user_metadata?.email],
    queryFn: () => getUserByEmail(user?.user?.user_metadata?.email),
    enabled: !!user?.user?.user_metadata?.email,
  });

  const {
    data: vehicle,
    isLoading: loadingVehicle,
    error: vehicleError,
  } = useQuery({
    queryKey: ["vehicle", reservation.vehiculo_id],
    queryFn: () => getVehicleById(reservation.vehiculo_id),
    enabled: !!reservation.vehiculo_id,
  });

  // Calcular la fecha de devolución
  const fechaReserva = new Date(reservation.fecha_reserva);
  const fechaDevolucion = new Date(
    fechaReserva.setDate(fechaReserva.getDate() + reservation.dias)
  );
  const hoy = new Date();

  const devolucionPasada = hoy > fechaDevolucion;

  return (
    <li className="flex flex-col bg-white rounded-lg shadow-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <p className="text-xl font-semibold text-gray-700">
          <strong>Reserva ID:</strong> {reservation.id}
        </p>
        <p className="text-sm text-gray-500">{reservation.fecha_reserva}</p>
      </div>

      <div className="mb-4">
        <strong className="text-gray-600">Vehículo:</strong>
        {loadingVehicle ? (
          <span className="text-gray-500">Cargando...</span>
        ) : vehicleError ? (
          <span className="text-red-500">Error al cargar vehículo</span>
        ) : (
          <p className="text-gray-700">
            {vehicle?.marca}: {vehicle?.modelo}
          </p>
        )}
      </div>

      <div className="mb-4">
        {loadingUser ? (
          <span className="text-gray-500">Cargando...</span>
        ) : userError ? (
          <span className="text-red-500">Error al cargar usuario</span>
        ) : (
          <p className="text-gray-700">{user?.user_metadata?.email}</p>
        )}
      </div>

      {loadingUserEmail ? (
        <div className="flex justify-center items-center">
          <span className="text-gray-500">
            Cargando detalles del usuario...
          </span>
        </div>
      ) : userEmailError ? (
        <p className="text-red-500">Error al cargar detalles del usuario</p>
      ) : (
        userEmailData && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">
              <strong>Nombre:</strong>{" "}
              {userEmailData.nombre + " " + userEmailData.apellido}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> {userEmailData.correo}
            </p>
          </div>
        )
      )}

      {/* Información adicional: Fecha de devolución y estado */}
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-600">
          <strong>Fecha de Devolución:</strong>{" "}
          {fechaDevolucion.toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Estado:</strong>{" "}
          {devolucionPasada ? (
            <span className="text-red-500">Devolución Pasada</span>
          ) : (
            <span className="text-green-500">En Tiempo</span>
          )}
        </p>
      </div>

      {/* Botón de Cancelar Reserva */}
      <div className="mt-4">
        <button
          onClick={() => onCancelReservation(reservation.id)}
          disabled={!devolucionPasada}
          className={`w-full py-2 rounded-lg text-white transition ${
            devolucionPasada
              ? "bg-red-500 hover:bg-red-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {devolucionPasada
            ? "Cancelar Reserva (Devolución Pasada)"
            : "No se puede cancelar (En Tiempo)"}
        </button>
      </div>
    </li>
  );
};

export default ReservationHistory;
