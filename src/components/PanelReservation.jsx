import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { deleteReservation } from "../provider/reservation/deleteReservation";
import { getReservationsWithDetails } from "../provider/reservation/getReservationsWithDetails";
import { getReservations } from "../provider/reservation/getReservations";
import Swal from "sweetalert2";

const PanelReservations = () => {
  const [reservationsWithUsers, setReservationsWithUsers] = useState([]);

  const { data: reservations = [], refetch } = useQuery({
    queryKey: ["reservations"],
    queryFn: getReservations,
    onSuccess: async (reservations) => {
      console.log("Reservas obtenidas en onSuccess:", reservations);
      // Obtener los IDs de los usuarios relacionados
      const userIds = reservations.map((reservation) => reservation.usuario_id);

      try {
        const users = await getReservationsWithDetails(userIds);
        console.log("Usuarios obtenidos:", users);

        const reservationsWithUsers = reservations.map((reservation, index) => {
          return { ...reservation, user: users[index] };
        });

        setReservationsWithUsers(reservationsWithUsers);
      } catch (error) {
        console.error("Error al obtener los usuarios:", error);
        setReservationsWithUsers(reservations);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReservation,
    onSuccess: () => {
      Swal.fire("Reserva eliminada con éxito", "", "success");
      refetch();
    },
    onError: () => {
      Swal.fire("Error al eliminar la reserva", "", "error");
    },
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const sortedReservations = [...reservationsWithUsers].sort(
    (a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio)
  );

  console.log("Reservas con usuarios:", sortedReservations);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-semibold mb-6">Reservas de Vehículos</h2>
        <table className="min-w-full bg-white shadow-sm rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-4 text-left text-gray-700">Cliente</th>
              <th className="p-4 text-left text-gray-700">Email Cliente</th>
              <th className="p-4 text-left text-gray-700">Vehículo</th>
              <th className="p-4 text-left text-gray-700">Fecha de Inicio</th>
              <th className="p-4 text-left text-gray-700">Fecha de Fin</th>
              <th className="p-4 text-left text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedReservations.length ? (
              sortedReservations.map((reservation) => (
                <tr key={reservation.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 text-gray-700">
                    {reservation.cliente_nombre}
                  </td>
                  <td className="p-4 text-gray-700">
                    {reservation.user?.email || "Email no disponible"}
                  </td>
                  <td className="p-4 text-gray-700">
                    {reservation.vehiculo_marca}
                  </td>
                  <td className="p-4 text-gray-700">
                    {new Date(reservation.fecha_inicio).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-gray-700">
                    {new Date(reservation.fecha_fin).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-7 space-x-2 flex flex-wrap items-end">
                    <button
                      onClick={() => handleDelete(reservation.id)}
                      className="bg-red-600 text-white py-1 px-4 rounded hover:bg-red-700 focus:outline-none"
                    >
                      Eliminar Reserva
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No hay reservas disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default PanelReservations;
