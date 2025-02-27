import React, { useState } from "react";
import Swal from "sweetalert2";
import { registerClient } from "../provider/user/clientes/registerClient";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/16/solid";
import logo from "@assets/logo.svg";
import { Link } from "react-router-dom";

const RegisterForm = ({ tipo, titulo }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    correo: "",
    contraseña: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre) newErrors.nombre = "El nombre es obligatorio";
    if (!formData.apellido) newErrors.apellido = "El apellido es obligatorio";
    if (!formData.dni || formData.dni.length < 8)
      newErrors.dni = "El DNI debe tener al menos 8 dígitos";
    if (!formData.correo)
      newErrors.correo = "El correo electrónico es obligatorio";
    else if (!/\S+@\S+\.\S+/.test(formData.correo))
      newErrors.correo = "El correo electrónico no es válido";
    if (!formData.contraseña)
      newErrors.contraseña = "La contraseña es obligatoria";
    if (!formData.confirmPassword)
      newErrors.confirmPassword =
        "La confirmación de contraseña es obligatoria";
    else if (formData.contraseña !== formData.confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      const userData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        correo: formData.correo,
        contraseña: formData.contraseña,
        tipo: tipo,
      };

      const { success, message } = await registerClient(userData);
      setIsLoading(false);

      if (success) {
        Swal.fire({
          icon: "success",
          title: "Registro exitoso",
          text: "Se ha enviado un correo de confirmación a tu email.",
          confirmButtonText: "Entendido",
        });
        setFormData({
          nombre: "",
          apellido: "",
          dni: "",
          correo: "",
          contraseña: "",
          confirmPassword: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: message || "Error al registrar",
        });
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <span className="bg-autheticate z-10" />
      <div className="max-w-md w-full p-6 bg-white shadow-xl rounded-lg z-30 relative">
        <h2 className="text-2xl font-bold text-start mb-6">{titulo}</h2>
        <img
          src={logo}
          alt="logo"
          className="absolute top-[0px] right-[-35px] transform -translate-x-1/2 w-24"
        />
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.nombre ? "border-red-500" : "border-gray-300"
              } rounded-lg`}
            />
            {errors.nombre && (
              <span className="text-red-500">{errors.nombre}</span>
            )}
          </div>

          <div>
            <input
              type="text"
              name="apellido"
              placeholder="Apellido"
              value={formData.apellido}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.apellido ? "border-red-500" : "border-gray-300"
              } rounded-lg`}
            />
            {errors.apellido && (
              <span className="text-red-500">{errors.apellido}</span>
            )}
          </div>

          <div>
            <input
              type="text"
              name="dni"
              placeholder="DNI"
              value={formData.dni}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.dni ? "border-red-500" : "border-gray-300"
              } rounded-lg`}
            />
            {errors.dni && <span className="text-red-500">{errors.dni}</span>}
          </div>

          <div>
            <input
              type="email"
              name="correo"
              placeholder="Correo electrónico"
              value={formData.correo}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.correo ? "border-red-500" : "border-gray-300"
              } rounded-lg`}
            />
            {errors.correo && (
              <span className="text-red-500">{errors.correo}</span>
            )}
          </div>

          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="contraseña"
                placeholder="Contraseña"
                value={formData.contraseña}
                onChange={handleChange}
                className={`w-full p-3 border ${
                  errors.contraseña ? "border-red-500" : "border-gray-300"
                } rounded-lg`}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5 text-gray-500" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
            {errors.contraseña && (
              <span className="text-red-500">{errors.contraseña}</span>
            )}
          </div>

          <div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirmar Contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full p-3 border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } rounded-lg`}
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="w-5 h-5 text-gray-500" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-red-500">{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-3 bg-blue-500 text-white font-semibold rounded-lg ${
              isLoading ? "cursor-not-allowed" : "hover:bg-blue-600"
            }`}
          >
            {isLoading ? "Registrando..." : "Registrar"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya estas registrado?{" "}
          <Link
            to={`/login`}
            className="text-blue-500 hover:text-blue-700 transition duration-200"
          >
            Ingresar
          </Link>
        </p>
        <p className="mt-4 text-center text-sm text-gray-600">
          <Link
            to={`/`}
            className="text-blue-500 hover:text-blue-700 transition duration-200"
          >
            Ir al inicio
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
