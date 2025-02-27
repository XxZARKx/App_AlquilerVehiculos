import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getVehicles } from "../provider/vehicle/getVehicles";
import { Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";

const PopularVehicleBrands = () => {
  const [view, setView] = useState("pie");
  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
  });

  const brandCounts = vehicles.reduce((acc, vehicle) => {
    const brandLower = vehicle.marca.toLowerCase();
    if (vehicle.estado?.toLowerCase() === "reservado") {
      acc[brandLower] = (acc[brandLower] || 0) + 1;
    }
    return acc;
  }, {});

  const sortedBrands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([brand, count]) => ({ brand, count }));

  const chartData = {
    labels: sortedBrands.map((b) => b.brand),
    datasets: [
      {
        data: sortedBrands.map((b) => b.count),
        backgroundColor: [
          "#ff6384",
          "#36a2eb",
          "#ffcd56",
          "#4bc0c0",
          "#9966ff",
        ],
      },
    ],
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <aside className="w-full md:w-64 bg-white shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Seleccionar Vista
        </h2>
        <button
          className={`w-full py-2 mb-3 rounded-lg transition ${
            view === "pie"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setView("pie")}
        >
          Gráfico Circular 📊
        </button>
        <button
          className={`w-full py-2 mb-3 rounded-lg transition ${
            view === "bar"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setView("bar")}
        >
          Gráfico de Barras 📈
        </button>
        <button
          className={`w-full py-2 rounded-lg transition ${
            view === "table"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setView("table")}
        >
          Vista de Tabla 📋
        </button>
      </aside>

      <main className="flex-1 p-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
          Distribución de Marcas de Vehículos Alquilados
        </h2>

        <div className="max-w-full md:max-w-2xl mx-auto bg-white p-6 shadow-md rounded-lg">
          {view === "pie" && <Pie data={chartData} className="w-full h-auto" />}

          {view === "bar" && (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true },
                },
              }}
              className="w-full h-64 md:h-96"
            />
          )}

          {/* Vista de Tabla */}
          {view === "table" && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="px-4 md:px-6 py-3 border-b-2 border-gray-200 text-left text-xs md:text-sm font-semibold text-gray-600">
                      Posición
                    </th>
                    <th className="px-4 md:px-6 py-3 border-b-2 border-gray-200 text-left text-xs md:text-sm font-semibold text-gray-600">
                      Marca
                    </th>
                    <th className="px-4 md:px-6 py-3 border-b-2 border-gray-200 text-left text-xs md:text-sm font-semibold text-gray-600">
                      Alquileres
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBrands.map((brand, index) => (
                    <tr
                      key={brand.brand}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-4 md:px-6 py-4 border-b border-gray-200 text-xs md:text-sm font-semibold text-gray-800">
                        {index + 1}
                      </td>
                      <td className="px-4 md:px-6 py-4 border-b border-gray-200 text-xs md:text-sm font-semibold text-gray-800">
                        {brand.brand}
                      </td>
                      <td className="px-4 md:px-6 py-4 border-b border-gray-200 text-xs md:text-sm font-semibold text-gray-800">
                        {brand.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PopularVehicleBrands;
