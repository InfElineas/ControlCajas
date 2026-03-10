"use client";

import { useState, useEffect } from "react";
import { Usuario } from "@/lib/constants";

export default function TablaUsuarios({
  usuario,
}: Readonly<{ usuario: Usuario }>) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/usuarios");
      const data = await res.json();
      if (res.ok) {
        setUsuarios(data);
      } else {
        setError(data.error || "Error al cargar usuarios");
      }
    } catch {
      setError("Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  const enableUsuario = async (u: Usuario, habilitado: boolean) => {
    try {
      const res = await fetch(`/api/usuarios?id=${u._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: u._id,
          habilitado: habilitado,
          ajuste: usuario.nombre,
        }),
      });
      if (res.ok) {
        fetchUsuarios();
      } else {
        const data = await res.json();
        setError(data.error || "Error habilitando usuario");
      }
    } catch {
      setError("Error en el servidor");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Usuarios</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-left">Nombre</th>
                <th className="border p-2 text-left">Rol</th>
                <th className="border p-2 text-left">Estado</th>
                <th className="border p-2 text-left">Autorizado por</th>
                <th className="border p-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u: Usuario) => (
                <tr key={u._id} className="hover:bg-gray-100">
                  <td className="border p-2">{u.nombre ?? "-"}</td>
                  <td className="border p-2">{u.rol ?? "-"}</td>
                  <td
                    className={
                      "border p-2 " +
                      (u.habilitado ? "text-green-600" : "text-red-600")
                    }
                  >
                    {u.habilitado ? "Habilitado" : "Deshabilitado"}
                  </td>
                  <td className="border p-2">{u.ajuste || "-"}</td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => enableUsuario(u, !u.habilitado)}
                      className={
                        "text-blue-600 hover:underline mr-2 " +
                        (u.habilitado ? "border-red-600" : "border-green-600")
                      }
                    >
                      {u.habilitado ? "Deshabilitar" : "Habilitar"}
                    </button>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="border p-4 text-center text-gray-500"
                  >
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
