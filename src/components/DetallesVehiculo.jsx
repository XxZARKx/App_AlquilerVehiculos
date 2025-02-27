import React from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getVehicleById } from "../provider/vehicle/getVehicleById";
import Header from "./Header";
import Footer from "./Footer";

const DetallesVehiculo = () => {
  const { id } = useParams();

  const {
    data: vehicle,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: () => getVehicleById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="text-center py-10 text-xl">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-xl text-red-600">
        Error al obtener los datos del vehículo.
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="bg-[#F7F9FB] min-h-screen flex justify-center items-center py-10">
        <div className="bg-white max-w-3xl w-full rounded-2xl shadow-xl p-8 space-y-8">
          <div className="flex justify-center mb-6">
            <img
              className="w-80 h-80 object-contain rounded-lg shadow-xl border-4 border-[#D1D1D1]"
              src={vehicle.imagen_url}
              alt={vehicle.marca}
            />
          </div>
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold text-[#1E3A8A] tracking-wide capitalize">
              {vehicle.marca}: {vehicle.modelo}
            </h1>
          </div>
          <div className="space-y-6 mt-6 text-gray-700 px-5">
            <div className="flex justify-between">
              <p className="text-lg">
                <strong className="text-[#566C85]">Precio:</strong> S/
                {vehicle.precio} /día
              </p>
              <p className="text-lg">
                <strong className="text-[#566C85]">Matrícula:</strong>{" "}
                {vehicle.matricula}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-lg">
                <strong className="text-[#566C85]">Puertas:</strong>{" "}
                {vehicle.puertas}
              </p>
              <p className="text-lg">
                <strong className="text-[#566C85]">Personas:</strong>{" "}
                {vehicle.cantidadpersonas}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-lg">
                <strong className="text-[#566C85]">Equipaje:</strong>{" "}
                {vehicle.equipaje}
              </p>
              <p className="text-lg">
                <strong className="text-[#566C85]">Categoría:</strong>{" "}
                {vehicle.categoria}
              </p>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            {vehicle.estado === "Disponible" ? (
              <Link
                to={`/reservation/${vehicle.id}`}
                className="bg-green-500 hover:bg-green-600 text-white text-lg py-3 px-8 rounded-full transition duration-300 transform hover:scale-105"
              >
                Reservar
              </Link>
            ) : (
              <button
                disabled
                className="bg-gray-400 cursor-not-allowed text-white text-lg py-3 px-8 rounded-full"
              >
                No Disponible
              </button>
            )}
            <Link
              onClick={() => window.history.back()}
              className="bg-[#566C85] text-white text-lg py-3 px-8 rounded-full hover:bg-[#435766] transition duration-300 transform hover:scale-105 ml-4"
            >
              Volver
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DetallesVehiculo;
