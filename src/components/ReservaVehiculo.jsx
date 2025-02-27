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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSucursal, setSelectedSucursal] = useState("");
  const today = new Date().toISOString().split("T")[0];

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

  const createReservationMutation = useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      console.log("reserva exitosa");
    },
    onError: () => {
      Swal.fire("Error", "Error al realizar la reserva.", "error");
    },
  });

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const startTimestamp = new Date(start).getTime();
    const endTimestamp = new Date(end).getTime();
    const diffTime = endTimestamp - startTimestamp;
    return diffTime === 0 ? 1 : Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const days = calculateDays(startDate, endDate);
  const totalPrice = days > 0 ? vehicle?.precio * days : 0;

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
      if (!startDate || !endDate) {
        Swal.fire("Error", "Selecciona un rango de fechas válido.", "warning");
        setLoading(false);
        return;
      }
      // Solo se valida que la fecha de inicio no sea posterior a la de devolución.
      if (new Date(startDate) > new Date(endDate)) {
        Swal.fire(
          "Error",
          "La fecha de inicio no puede ser mayor a la de devolución.",
          "warning"
        );
        setLoading(false);
        return;
      }

      const reservation = {
        vehiculo_id: vehicle.id,
        usuario_id: user.id,
        dias: days,
        total: totalPrice,
        sucursal_id: selectedSucursal,
        fecha_reserva: startDate,
        fecha_devolucion: endDate,
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
            <label
              htmlFor="startDate"
              className="block text-sm font-medium mb-2"
            >
              Fecha de inicio:
            </label>
            <input
              id="startDate"
              type="date"
              min={today}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium mb-2">
              Fecha de devolución:
            </label>
            <input
              id="endDate"
              type="date"
              min={startDate || today}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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
              <strong>Días seleccionados:</strong>{" "}
              {days > 0 ? `${days} día(s)` : "No seleccionado"}
            </p>
            <p>
              <strong>Total estimado:</strong> S/ {totalPrice.toFixed(2)}
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
