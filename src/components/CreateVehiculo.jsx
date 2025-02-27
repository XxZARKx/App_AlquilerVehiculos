import React, { useState } from "react";
import Swal from "sweetalert2";
import { uploadImage } from "../provider/vehicle/uploadImage";
import { createVehicle } from "../provider/vehicle/createVehicle";

const CreateVehicleForm = () => {
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
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isFileValid, setIsFileValid] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      setIsFileValid(true);
      setImagePreview(URL.createObjectURL(selectedFile));
    } else {
      setIsFileValid(false);
      setImagePreview(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const matriculaRegex = /^[A-Za-z0-9]{1,5}-[A-Za-z0-9]{1,5}$/;
    if (!matriculaRegex.test(formData.matricula)) {
      Swal.fire({
        icon: "error",
        title: "La matrícula debe tener el formato válido (ej. ABC-1234).",
      });
      return;
    }

    if (!file) {
      Swal.fire({
        icon: "error",
        title: "Por favor, selecciona una imagen",
      });
      return;
    }

    setIsLoading(true);

    const imageUrl = await uploadImage(file);
    if (!imageUrl) {
      Swal.fire({
        icon: "error",
        title: "Error al subir la imagen",
      });
      setIsLoading(false);
      return;
    }

    const vehicleData = { ...formData, imagen_url: imageUrl };

    const isSuccess = await createVehicle(vehicleData);
    setIsLoading(false);

    if (isSuccess) {
      Swal.fire({
        icon: "success",
        title: "Vehículo creado con éxito",
      });

      setFormData({
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
      setFile(null);
      setImagePreview(null);
      setIsFileValid(false);
    } else {
      Swal.fire({
        icon: "error",
        title: "Error al crear el vehículo",
      });
    }
  };

  const isFormValid = () => {
    return (
      formData.marca &&
      formData.modelo &&
      formData.matricula &&
      formData.precio &&
      isFileValid
    );
  };

  return (
    <div className="min-h-screen bg-[#E4E4E4] flex items-center justify-center relative py-10 px-4">
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-700 text-center mb-6">
          Crear Vehículo
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="marca"
            placeholder="Marca"
            value={formData.marca}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="modelo"
            placeholder="Modelo"
            value={formData.modelo}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            name="matricula"
            placeholder="Matrícula"
            value={formData.matricula}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="relative w-full">
            <label
              htmlFor="file-input"
              className={`flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition duration-300 ${
                isFileValid
                  ? "border-green-500 text-green-600"
                  : "border-blue-500 text-blue-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 mb-3"
                viewBox="0 0 64 64"
                fill="currentColor"
              >
                <path d="M32 2C15.433 2 2 15.433 2 32s13.433 30 30 30 30-13.433 30-30S48.567 2 32 2zm0 58C16.268 60 4 47.732 4 32S16.268 4 32 4s28 12.268 28 28-12.268 28-28 28zM22 34l6-6 4 4 6-6 10 10H12z" />
              </svg>
              <span className="text-sm font-semibold">
                {isFileValid
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
                className="w-32 h-32 object-cover rounded-lg mx-auto"
              />
            </div>
          )}

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
            value={formData.precio}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Disponible">Disponible</option>
            <option value="En mantenimiento">En mantenimiento</option>
            <option value="Reservado">Reservado</option>
            <option value="Fuera de servicio">Fuera de servicio</option>
          </select>

          <button
            type="submit"
            disabled={!isFormValid() || isLoading}
            className={`w-full ${
              !isFormValid() || isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white font-bold py-2 rounded-lg transition duration-300`}
          >
            Crear Vehículo
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateVehicleForm;
