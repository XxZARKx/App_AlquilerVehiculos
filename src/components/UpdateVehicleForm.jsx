import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { updateVehicle } from "../provider/vehicle/updateVehicle";
import { getVehicleById } from "../provider/vehicle/getVehicleById";
import { uploadImage } from "../provider/vehicle/uploadImage";

const UpdateVehicleForm = ({ vehicleId, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    marca: "",
    modelo: "",
    matricula: "",
    estado: "Disponible",
    cantidadpersonas: 4,
    puertas: 4,
    equipaje: 2,
    categoria: "A",
    precio: "",
    imagen_url: "",
  });
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    data: vehicle,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: () => getVehicleById(vehicleId),
  });

  const mutation = useMutation({
    mutationFn: updateVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries(["vehicle"]);
      Swal.fire({
        icon: "success",
        title: "Vehículo actualizado con éxito",
      });
      onClose();
    },
    onError: (error) => {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error al actualizar el vehículo",
        text: "Hubo un problema al actualizar el vehículo.",
      });
    },
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        matricula: vehicle.matricula,
        estado: vehicle.estado,
        cantidadpersonas: vehicle.cantidadpersonas,
        puertas: vehicle.puertas,
        equipaje: vehicle.equipaje,
        categoria: vehicle.categoria,
        precio: vehicle.precio,
        imagen_url: vehicle.imagen_url,
      });
      setImagePreview(vehicle.imagen_url);
    }
  }, [vehicle]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vehicleId) {
      console.error("El ID del vehículo es necesario.");
      return;
    }

    let imageUrl = formData.imagen_url;
    if (file) {
      try {
        imageUrl = await uploadImage(file);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error al subir la imagen",
          text: error.message || "Hubo un problema al subir la imagen.",
        });
        return;
      }
    }

    try {
      mutation.mutate({
        ...formData,
        imagen_url: imageUrl,
        id: vehicleId,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al actualizar el vehículo",
        text: error.message || "Hubo un problema al actualizar el vehículo.",
      });
    }
  };

  if (isLoading) return <div>Cargando...</div>;
  if (isError) return <div>Error al cargar el vehículo.</div>;

  return (
    <div className="min-h-screen bg-[#E4E4E4] flex items-center justify-center relative py-10">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-700 text-center mb-6">
          Actualizar Vehículo
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="marca"
            placeholder="Marca"
            value={formData.marca || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="modelo"
            placeholder="Modelo"
            value={formData.modelo || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            name="matricula"
            placeholder="Matrícula"
            value={formData.matricula || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="estado"
            value={formData.estado || "Disponible"}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Disponible">Disponible</option>
            <option value="En mantenimiento">En mantenimiento</option>
            <option value="Reservado">Reservado</option>
            <option value="Fuera de servicio">Fuera de servicio</option>
          </select>

          <select
            name="cantidadpersonas"
            value={formData.cantidadpersonas}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2}>2 Personas</option>
            <option value={4}>4 Personas</option>
            <option value={5}>5 Personas</option>
            <option value={7}>7 Personas</option>
          </select>

          <select
            name="puertas"
            value={formData.puertas}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2}>2 Puertas</option>
            <option value={4}>4 Puertas</option>
            <option value={5}>5 Puertas</option>
          </select>

          <select
            name="equipaje"
            value={formData.equipaje}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>1 Maleta</option>
            <option value={2}>2 Maletas</option>
            <option value={3}>3 Maletas</option>
            <option value={4}>4 Maletas</option>
          </select>

          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="A">Categoría A</option>
            <option value="B">Categoría B</option>
          </select>

          <input
            type="number"
            name="precio"
            placeholder="Precio"
            value={formData.precio || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="relative w-full">
            <label
              htmlFor="file-input"
              className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer"
            >
              <span className="text-sm font-semibold">
                {file
                  ? "Imagen seleccionada correctamente"
                  : "Haz clic para subir una imagen"}
              </span>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Vista previa"
                className="w-32 h-32 object-contain rounded-lg mx-auto"
              />
            </div>
          )}
          <div className="flex justify-center gap-2">
            <button
              type="submit"
              className="w-1/2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            >
              Actualizar Vehículo
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateVehicleForm;
