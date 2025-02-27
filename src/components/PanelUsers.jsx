import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { getClient } from "../provider/user/clientes/getClient";
import { deleteClient } from "../provider/user/clientes/deleteClient";

const PanelUsers = () => {
  const { data: users = [], refetch } = useQuery({
    queryKey: ["users"],
    queryFn: getClient,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      Swal.fire("Usuario eliminado con éxito", "", "success");
      refetch();
    },
    onError: () => {
      Swal.fire("Error al eliminar el usuario", "", "error");
    },
  });

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

  const filteredUsers = users.filter((user) => user.tipo === 2);

  return (
    <div className="flex min-h-screen bg-gray-100 p-4">
      <main className="flex-1 p-6 overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center xl:text-start">
          Usuarios ({filteredUsers.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow-sm rounded-lg text-sm md:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-4 text-left text-gray-700">Nombre</th>
                <th className="p-4 text-left text-gray-700">Apellido</th>
                <th className="p-4 text-left text-gray-700">DNI</th>
                <th className="p-4 text-left text-gray-700">Correo</th>
                <th className="p-4 text-left text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="p-4 text-gray-700">{user.nombre}</td>
                    <td className="p-4 text-gray-700">{user.apellido}</td>
                    <td className="p-4 text-gray-700">{user.dni}</td>
                    <td className="p-4 text-gray-700">{user.correo}</td>
                    <td className="px-4 py-2 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-600 text-white py-1 px-4 rounded hover:bg-red-700 focus:outline-none text-xs md:text-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No hay usuarios disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default PanelUsers;
