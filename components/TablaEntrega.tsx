"use client";

import { Entrega } from "@/lib/constants";
import { useState, useEffect } from "react";

export default function TablaEntrega({
  usuario,
  fecha,
  onAjustar,
}: Readonly<{
  usuario: any;
  fecha: string;
  onAjustar?: (tipo: string, id: string) => void;
}>) {
  const [datos, setDatos] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDatos();
  }, [fecha]);

  const fetchDatos = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/eventos/list?fecha=${fecha}&tipo=Entrega`);
      const data = await res.json();
      if (res.ok) setDatos(data);
      else setError(data.error || "Error al cargar eventos");
    } catch {
      setError("Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded mb-4">
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
                <th
                  colSpan={6}
                  className="text-2xl font-bold border p-2 text-center text-gray-800 bg-sky-50"
                >
                  Entregas
                </th>
                {usuario.rol === "informatico" && (
                  <th
                    colSpan={2}
                    className="text-2xl font-bold border p-2 text-center text-gray-800 bg-slate-50"
                  >
                    Ajuste
                  </th>
                )}
              </tr>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Centro</th>
                <th className="border p-2 text-left">Chofer</th>
                <th className="border p-2 text-left">Chapa</th>
                <th className="border p-2 text-center">Blancas</th>
                <th className="border p-2 text-center">Negras</th>
                <th className="border p-2 text-center">Verdes</th>
                {usuario.rol === "informatico" && (
                  <th className="border p-2 text-center">Ajustado por</th>
                )}
                {usuario.rol === "informatico" && (
                  <th className="border p-2 text-center">Ajustar</th>
                )}
              </tr>
            </thead>
            <tbody>
              {datos.length === 0 ? (
                <tr>
                  <td
                    colSpan={16}
                    className="border p-4 text-center text-gray-500"
                  >
                    No hay eventos para esta fecha
                  </td>
                </tr>
              ) : (
                datos.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-100">
                    <td className="border p-2">
                      {d.centro_distribucion ?? "-"}
                    </td>
                    <td className="border p-2">{d.nombre ?? "-"}</td>
                    <td className="border p-2">{d.chapa ?? "-"}</td>
                    <td className="border p-2 text-center">
                      {d.cajas?.blancas ?? "-"}
                    </td>
                    <td className="border p-2 text-center">
                      {d.cajas?.negras ?? "-"}
                    </td>
                    <td className="border p-2 text-center">
                      {d.cajas?.verdes ?? "-"}
                    </td>
                    {usuario.rol === "informatico" && (
                      <td className="border p-2 text-center">
                        {d.ajuste || "-"}
                      </td>
                    )}
                    {usuario.rol === "informatico" && (
                      <td className="border p-2 text-center">
                        <button
                          className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-300"
                          onClick={() => onAjustar?.("Entrega", d._id!)}
                        >
                          Ajustar
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
