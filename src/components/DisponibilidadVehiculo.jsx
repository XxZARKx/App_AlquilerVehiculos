import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getVehicles } from "../provider/vehicle/getVehicles";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import { supabase } from "../../api/supabaseClient";

const VehicleAvailabilityReport = () => {
  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
  });

  const fetchIngresosReservados = async () => {
    const { data, error } = await supabase
      .from("reserva")
      .select("total, vehiculo_id");

    if (error) {
      console.error("Error al obtener reservas:", error);
      throw new Error(error.message);
    }

    const ingresosPorVehiculo = data.reduce((acc, reserva) => {
      if (!acc[reserva.vehiculo_id]) {
        acc[reserva.vehiculo_id] = 0;
      }
      acc[reserva.vehiculo_id] += reserva.total;
      return acc;
    }, {});

    return ingresosPorVehiculo;
  };

  const {
    data: ingresosReservados,
    isLoading: isLoadingIngresos,
    error: errorIngresos,
  } = useQuery({
    queryKey: ["ingresosReservados"],
    queryFn: fetchIngresosReservados,
  });

  const vehicleCounts = vehicles.reduce(
    (acc, vehicle) => {
      // Un vehículo está reservado si aparece en la tabla reserva
      const estaReservado = ingresosReservados?.[vehicle.id] > 0;
      if (estaReservado) {
        acc.reservado++;
      } else {
        acc.disponible++;
      }
      return acc;
    },
    { disponible: 0, reservado: 0 }
  );

  const totalIngresosReservados = Object.values(
    ingresosReservados || {}
  ).reduce((sum, ingreso) => sum + ingreso, 0);

  const chartData = {
    labels: ["Disponibles", "Reservados"],
    datasets: [
      {
        data: [vehicleCounts.disponible, vehicleCounts.reservado],
        backgroundColor: ["#36a2eb", "#ff6384"],
        hoverBackgroundColor: ["#36a2eb", "#ff6384"],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Vehículos Disponibles vs. Reservados
        </h2>

        {/* Gráfico de pastel y resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Distribución de Vehículos
            </h3>
            <Doughnut data={chartData} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Resumen
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-700">
                  <strong>Vehículos Disponibles:</strong>{" "}
                  {vehicleCounts.disponible}
                </p>
              </div>
              <div>
                <p className="text-gray-700">
                  <strong>Vehículos Reservados:</strong>{" "}
                  {vehicleCounts.reservado}
                </p>
              </div>
              <div>
                <p className="text-gray-700">
                  <strong>Ingresos por Reservas:</strong> S/{" "}
                  {totalIngresosReservados.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de vehículos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Detalles de Vehículos
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 border-b text-left text-xs md:text-sm font-semibold text-gray-600">
                    Marca
                  </th>
                  <th className="px-4 py-3 border-b text-left text-xs md:text-sm font-semibold text-gray-600">
                    Modelo
                  </th>
                  <th className="px-4 py-3 border-b text-left text-xs md:text-sm font-semibold text-gray-600">
                    Estado
                  </th>
                  <th className="px-4 py-3 border-b text-left text-xs md:text-sm font-semibold text-gray-600">
                    Ingresos Generados (S/)
                  </th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => {
                  const estaReservado = ingresosReservados?.[vehicle.id] > 0;
                  return (
                    <tr
                      key={vehicle.id}
                      className="hover:bg-gray-50 transition-colors duration-200 text-xs md:text-sm"
                    >
                      <td className="px-4 py-3 border-b text-gray-800 font-medium">
                        {vehicle.marca}
                      </td>
                      <td className="px-4 py-3 border-b text-gray-800 font-medium">
                        {vehicle.modelo}
                      </td>
                      <td className="px-4 py-3 border-b">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            estaReservado
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {estaReservado ? "Reservado" : "Disponible"}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b text-gray-800 font-medium">
                        {ingresosReservados?.[vehicle.id]?.toFixed(2) || "0.00"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleAvailabilityReport;
