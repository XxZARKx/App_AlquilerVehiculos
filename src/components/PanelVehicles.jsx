import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getVehicles } from "../provider/vehicle/getVehicles";
import { deleteVehicle } from "../provider/vehicle/deleteVehicle";
import Swal from "sweetalert2";
import UpdateVehicleForm from "./UpdateVehicleForm";

const PanelVehicles = () => {
	const { data: vehicles = [], refetch } = useQuery({
		queryKey: ["vehicles"],
		queryFn: getVehicles,
	});

	const [selectedVehicleId, setSelectedVehicleId] = useState(null);
	const [showUpdateForm, setShowUpdateForm] = useState(false);
	const [activeTab, setActiveTab] = useState("Disponible"); // Estado activo por defecto

	// Filtrar vehículos por estado
	const vehiclesByStatus = vehicles.reduce((acc, vehicle) => {
		if (!acc[vehicle.estado]) {
			acc[vehicle.estado] = [];
		}
		acc[vehicle.estado].push(vehicle);
		return acc;
	}, {});

	// Estados posibles
	const statuses = [
		"Reservado",
		"Disponible",
		"En mantenimiento",
		"Fuera de Servicio",
	];

	// Función para eliminar un vehículo
	const deleteMutation = useMutation({
		mutationFn: deleteVehicle,
		onSuccess: () => {
			Swal.fire("Vehículo eliminado con éxito", "", "success");
			refetch();
		},
		onError: () => {
			Swal.fire("Error al eliminar el vehículo", "", "error");
		},
	});

	const handleUpdate = (id) => {
		setSelectedVehicleId(id);
		setShowUpdateForm(true);
	};

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

	return (
		<div className="flex min-h-screen bg-gray-100">
			<main className="flex-1 p-6">
				<h2 className="text-2xl font-semibold mb-6">Panel de Vehículos</h2>

				{/* Pestañas para cada estado */}
				<div className="mb-6">
					<div className="flex space-x-4 border-b border-gray-200">
						{statuses.map((status) => (
							<button
								key={status}
								onClick={() => setActiveTab(status)}
								className={`px-4 py-2 text-sm font-medium ${
									activeTab === status
										? "text-blue-600 border-b-2 border-blue-600"
										: "text-gray-500 hover:text-gray-700"
								}`}>
								{status} ({vehiclesByStatus[status]?.length || 0})
							</button>
						))}
					</div>
				</div>

				{/* Contenido de la pestaña activa */}
				<div>
					{statuses.map((status) => (
						<div
							key={status}
							className={`${activeTab === status ? "block" : "hidden"}`}>
							<h3 className="text-xl font-semibold text-gray-800 mb-4">
								{status} ({vehiclesByStatus[status]?.length || 0})
							</h3>
							<table className="min-w-full bg-white shadow-sm rounded-lg overflow-hidden">
								<thead className="bg-gray-200">
									<tr>
										<th className="p-4 text-left text-gray-700">Imagen</th>
										<th className="p-4 text-left text-gray-700">Marca</th>
										<th className="p-4 text-left text-gray-700">Matrícula</th>
										<th className="p-4 text-left text-gray-700">Precio</th>
										<th className="p-4 text-left text-gray-700">Acciones</th>
									</tr>
								</thead>
								<tbody>
									{vehiclesByStatus[status]?.map((vehicle) => (
										<tr
											key={vehicle.id}
											className="border-t hover:bg-gray-50 transition-colors">
											<td className="p-4">
												<img
													src={vehicle.imagen_url}
													alt={vehicle.marca}
													className="w-16 h-16 rounded object-contain"
												/>
											</td>
											<td className="p-4 text-gray-700">{vehicle.marca}</td>
											<td className="p-4 text-gray-700">{vehicle.matricula}</td>
											<td className="p-4 text-gray-700">S/{vehicle.precio}</td>
											<td className="p-4 flex space-x-2">
												<button
													onClick={() => handleUpdate(vehicle.id)}
													className="bg-blue-600 text-white py-1 px-4 rounded hover:bg-blue-700 focus:outline-none">
													Actualizar
												</button>
												<button
													onClick={() => handleDelete(vehicle.id)}
													className="bg-red-600 text-white py-1 px-4 rounded hover:bg-red-700 focus:outline-none">
													Eliminar
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					))}
				</div>

				{/* Formulario de actualización */}
				{showUpdateForm && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
						<div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl overflow-y-auto max-h-[80vh]">
							<UpdateVehicleForm
								vehicleId={selectedVehicleId}
								onClose={() => setShowUpdateForm(false)}
							/>
						</div>
					</div>
				)}
			</main>
		</div>
	);
};

export default PanelVehicles;
