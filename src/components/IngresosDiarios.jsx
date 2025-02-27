import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { supabase } from "../../api/supabaseClient";

const IngresosDiarios = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const fetchIngresos = async () => {
    if (!startDate || !endDate) return [];

    const startDateUTC = new Date(startDate);
    startDateUTC.setUTCHours(0, 0, 0, 0);

    const endDateUTC = new Date(endDate);
    endDateUTC.setUTCHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("reserva")
      .select("total, fecha_reserva_realizada")
      .gte("fecha_reserva_realizada", startDateUTC.toISOString())
      .lte("fecha_reserva_realizada", endDateUTC.toISOString());

    if (error) {
      console.error("Error al obtener ingresos:", error);
      throw new Error(error.message);
    }

    const ingresosAgrupados = data.reduce((acc, ingreso) => {
      const fecha = new Date(
        ingreso.fecha_reserva_realizada
      ).toLocaleDateString("es-PE", {
        timeZone: "America/Lima",
      });
      if (!acc[fecha]) {
        acc[fecha] = 0;
      }
      acc[fecha] += ingreso.total;
      return acc;
    }, {});

    const ingresosArray = Object.entries(ingresosAgrupados).map(
      ([fecha, total]) => ({ fecha, total })
    );

    ingresosArray.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    return ingresosArray;
  };

  const {
    data: ingresos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ingresos", startDate, endDate],
    queryFn: fetchIngresos,
    enabled: !!startDate && !!endDate,
  });

  const totalIngresos =
    ingresos?.reduce((sum, ingreso) => sum + ingreso.total, 0) || 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Reporte de ingresos
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Fecha de inicio:
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              maxDate={endDate || new Date()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholderText="Selecciona una fecha"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Fecha de fin:
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              minDate={startDate}
              maxDate={new Date()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholderText="Selecciona una fecha"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-500">Cargando ingresos...</div>
        ) : error ? (
          <div className="text-center text-red-500">
            Error al cargar los datos: {error.message}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Resultados:
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              <strong>Total de ingresos:</strong> S/ {totalIngresos.toFixed(2)}
            </p>
            <ul className="space-y-3">
              {ingresos?.map((ingreso, index) => (
                <li
                  key={index}
                  className="bg-gray-200 p-4 rounded-lg shadow-sm"
                >
                  <p className="text-gray-700">
                    <strong>Fecha:</strong> {ingreso.fecha} -{" "}
                    <strong>Ingreso:</strong> S/ {ingreso.total.toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default IngresosDiarios;
