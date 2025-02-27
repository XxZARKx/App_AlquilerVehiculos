import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getVehicles } from "../provider/vehicle/getVehicles";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const VehiculosConMayorGanancia = () => {
  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
  });

  const vehicleEarnings = vehicles.reduce((acc, vehicle) => {
    const key = `${vehicle.marca} ${vehicle.modelo}`;
    if (vehicle.estado?.toLowerCase() === "reservado") {
      acc[key] = (acc[key] || 0) + vehicle.total;
    }
    return acc;
  }, {});

  const sortedVehicles = Object.entries(vehicleEarnings)
    .sort((a, b) => b[1] - a[1])
    .map(([vehicle, earnings]) => ({ vehicle, earnings }));

  const chartData = {
    labels: sortedVehicles.map((v) => v.vehicle),
    datasets: [
      {
        label: "Ingresos (S/)",
        data: sortedVehicles.map((v) => v.earnings),
        backgroundColor: "#36a2eb", // Color de las barras
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Vehículos con Mayor Ganancia
        </h2>

        {/* Gráfico de Barras */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true },
              },
            }}
          />
        </div>

        {/* Tabla de Detalles */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Detalles de Ingresos por Vehículo
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600">
                    Vehículo
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-sm font-semibold text-gray-600">
                    Ingresos (S/)
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedVehicles.map((vehicle, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 border-b border-gray-200 text-sm font-semibold text-gray-800">
                      {vehicle.vehicle}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200 text-sm font-semibold text-gray-800">
                      {vehicle.earnings.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiculosConMayorGanancia;
