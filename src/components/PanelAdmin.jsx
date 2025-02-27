import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import PanelVehicles from "./PanelVehicles";
import PanelUsers from "./PanelUsers";
import IngresosDiarios from "./IngresosDiarios";
import PopularVehicleBrands from "./PanelTopVehicles";
import ReservationHistory from "./ReservationHistory";
import VehicleAvailabilityReport from "./DisponibilidadVehiculo";

const panels = {
  vehiculos: PanelVehicles,
  usuarios: PanelUsers,
  ingresos: IngresosDiarios,
  top: PopularVehicleBrands,
  reservationHistory: ReservationHistory,
  ingresoVehiculo: VehicleAvailabilityReport,
};

const menuItems = [
  { path: "usuarios", label: "Lista de Usuarios" },
  { path: "vehiculos", label: "Autos Disponibles" },
  { path: "ingresos", label: "Ingresos" },
  { path: "ingresoVehiculo", label: "Ingreso Por Vehiculo" },
  { path: "top", label: "Vehiculos Populares" },
  { path: "reservationHistory", label: "Historial de reservas" },
];

const PanelAdmin = () => {
  const { pestania } = useParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const SelectedPanel =
    panels[pestania] ||
    (() => (
      <div className="text-center text-xl text-red-600">
        Panel no encontrado
      </div>
    ));

  return (
    <div>
      <Header />
      <div className="flex flex-col md:flex-row">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-4 bg-gray-800 text-white text-center"
        >
          {isMenuOpen ? "Cerrar Menú" : "Abrir Menú"}
        </button>
        <aside
          className={`${
            isMenuOpen ? "block" : "hidden"
          } md:block w-full md:w-1/5 bg-gray-800 text-white p-6 space-y-6 shadow-md min-h-screen`}
        >
          <h2 className="text-2xl font-bold text-center">Panel Admin</h2>
          <ul className="space-y-4 text-lg">
            {menuItems.map(({ path, label }) => (
              <li key={path}>
                <Link
                  to={`/admin/panel/${path}`}
                  className="hover:bg-gray-700 p-2 rounded block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <main className="w-full md:w-4/5 p-6">
          <SelectedPanel />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default PanelAdmin;
