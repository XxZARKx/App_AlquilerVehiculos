import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateReservationDate } from "../provider/reservation/updateReservationDate";
import Swal from "sweetalert2";

const UpdateReservationForm = ({ reservationId, onClose }) => {
  const [newDate, setNewDate] = useState("");
  const updateMutation = useMutation({
    mutationFn: updateReservationDate,
    onSuccess: () => {
      Swal.fire("Reserva actualizada con éxito", "", "success");
      onClose();
    },
    onError: () => {
      Swal.fire("Error al actualizar la reserva", "", "error");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({ reservationId, newDate });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md overflow-y-auto max-h-[80vh]">
      <h3 className="text-xl font-semibold mb-4">
        Actualizar Fecha de Reserva
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="newDate" className="block text-gray-700">
            Nueva Fecha
          </label>
          <input
            type="date"
            id="newDate"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="mt-1 p-2 border border-gray-300 rounded w-full"
          />
        </div>
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 text-white py-1 px-4 rounded hover:bg-gray-600 focus:outline-none"
          >
            Cerrar
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white py-1 px-4 rounded hover:bg-blue-700 focus:outline-none"
          >
            Actualizar
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateReservationForm;
