import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getVehicles } from "../provider/vehicle/getVehicles";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import { supabase } from "../../api/supabaseClient";

const VehicleAvailabilityReport = () => {
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
  });

  const fetchIngresosReservados = async () => {
    const { data, error } = await supabase
      .from("reserva")
      .select("total, vehiculo_id");
    if (error) {
      console.error("Error fetching reservations:", error);
      throw new Error(error.message);
    }
    return data.reduce((acc, reserva) => {
      acc[reserva.vehiculo_id] =
        (acc[reserva.vehiculo_id] || 0) + reserva.total;
      return acc;
    }, {});
  };

  const {
    data: ingresosReservados = {},
    isLoading: isLoadingIngresos,
    error: errorIngresos,
  } = useQuery({
    queryKey: ["ingresosReservados"],
    queryFn: fetchIngresosReservados,
  });

  const processVehiclesData = () => {
    const vehiclesByBrand = {};
    let totalDisponibles = 0;
    let totalReservados = 0;
    let totalIngresos = 0;

    vehicles.forEach((vehicle) => {
      const estaReservado = ingresosReservados?.[vehicle.id] > 0;
      if (estaReservado) {
        totalReservados++;
        totalIngresos += ingresosReservados[vehicle.id] || 0;

        if (!vehiclesByBrand[vehicle.marca]) {
          vehiclesByBrand[vehicle.marca] = { cantidad: 0, ingresos: 0 };
        }
        vehiclesByBrand[vehicle.marca].cantidad += 1;
        vehiclesByBrand[vehicle.marca].ingresos +=
          ingresosReservados[vehicle.id] || 0;
      } else {
        totalDisponibles++;
      }
    });

    return {
      vehiclesByBrand,
      totalDisponibles,
      totalReservados,
      totalIngresos,
    };
  };

  const { vehiclesByBrand, totalDisponibles, totalReservados, totalIngresos } =
    processVehiclesData();

  const tableData = Object.entries(vehiclesByBrand).map(([marca, datos]) => ({
    marca,
    cantidad: datos.cantidad,
    ingresos: datos.ingresos,
  }));

  tableData.sort((a, b) => b.ingresos - a.ingresos);

  const chartData = {
    labels: ["Disponibles", "Reservados"],
    datasets: [
      {
        data: [totalDisponibles, totalReservados],
        backgroundColor: ["#36a2eb", "#ff6384"],
        hoverBackgroundColor: ["#36a2eb", "#ff6384"],
      },
    ],
  };

  if (isLoadingVehicles || isLoadingIngresos) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  if (errorIngresos) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Error al cargar los datos.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Informe de Disponibilidad de Vehículos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Distribución de Vehículos
            </h3>
            <Doughnut data={chartData} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Resumen General
            </h3>
            <ul className="space-y-3">
              <li>
                <span className="font-medium text-gray-700">Disponibles:</span>{" "}
                <span className="text-gray-800">{totalDisponibles}</span>
              </li>
              <li>
                <span className="font-medium text-gray-700">Reservados:</span>{" "}
                <span className="text-gray-800">{totalReservados}</span>
              </li>
              <li>
                <span className="font-medium text-gray-700">
                  Ingresos Totales:
                </span>{" "}
                <span className="text-gray-800">
                  S/ {totalIngresos.toFixed(2)}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Ingresos por Marca
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 border-b text-left font-semibold text-gray-600">
                    Marca
                  </th>
                  <th className="px-4 py-3 border-b text-left font-semibold text-gray-600">
                    Cantidad
                  </th>
                  <th className="px-4 py-3 border-b text-left font-semibold text-gray-600">
                    Ingresos Generados (S/)
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? (
                  tableData.map((row, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-4 py-3 border-b text-gray-800">
                        {row.marca}
                      </td>
                      <td className="px-4 py-3 border-b text-gray-800">
                        {row.cantidad}
                      </td>
                      <td className="px-4 py-3 border-b text-gray-800">
                        S/ {row.ingresos.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-4 py-3 border-b text-center text-gray-500"
                    >
                      No hay datos disponibles.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleAvailabilityReport;
