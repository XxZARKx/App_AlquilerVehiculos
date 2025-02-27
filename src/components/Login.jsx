import React, { useState } from "react";
import { loginUser } from "../provider/user/loginUser";
import logo from "@assets/logo.svg";
import { Link } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/16/solid";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await loginUser(email, password);

      if (!user) {
        setErrorMessage("Error: Usuario no encontrado.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));

      window.location.href = "/";
    } catch (error) {
      setErrorMessage(error.message || "Error al iniciar sesión.");
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-r">
      <span className="bg-autheticate" />

      <div className="bg-white p-8 rounded-xl shadow-xl max-w-sm w-full z-40">
        <img src={logo} alt="logo" className="mx-auto mb-6 w-32" />
        <h2 className="text-center text-3xl font-bold mb-6 text-gray-800">
          Iniciar Sesión
        </h2>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <input
            className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="email"
            name="email"
            id="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="relative">
            <input
              className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5 text-gray-600" />
              ) : (
                <EyeIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
          {errorMessage && (
            <div className="text-red-500 text-sm mt-2 text-center">
              {errorMessage}
            </div>
          )}
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            Ingresar
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tienes una Cuenta?{" "}
          <Link
            to={`/register`}
            className="text-blue-500 hover:text-blue-700 transition duration-200"
          >
            Regístrate
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

export default Login;
