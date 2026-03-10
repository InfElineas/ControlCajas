"use client";

import { useState, useEffect } from "react";

export interface ItemExpedicionEntrega {
  chapa: string;
  centro_distribucion: string;
  almacen: string;
  expedicion: any;
  entrega: any;
  alerta: boolean;
}

export default function TablaExpedicionEntrega({
  fecha,
  datos = [],
  setDatos,
}: Readonly<{
  fecha: string;
  datos: ItemExpedicionEntrega[];
  setDatos: (datos: ItemExpedicionEntrega[]) => void;
}>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDatos();
  }, [fecha]);

  const fetchDatos = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/comparar?fecha=${fecha}&tipo=expedicion_entrega`,
      );
      const data = await response.json();
      if (response.ok) {
        setDatos(data);
      } else {
        setError(data.error || "Error al cargar datos");
      }
    } catch {
      setError("Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Expedición - Entrega
      </h2>

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
                <th colSpan={3} className="border p-2 text-left">
                  Centro de Distribución
                </th>
                <th colSpan={5} className="border p-2 text-center bg-green-50">
                  Expedición
                </th>
                <th colSpan={5} className="border p-2 text-center bg-sky-50">
                  Entrega
                </th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border p-2 text-center">CD</th>
                <th className="border p-2 text-center">Almacén</th>
                <th className="border p-2 text-center">Chapa</th>
                <th className="border p-2 text-center">Expedidor</th>
                <th className="border p-2 text-center">Ajuste</th>
                <th className="border p-2 text-center">Blancas</th>
                <th className="border p-2 text-center">Negras</th>
                <th className="border p-2 text-center">Verdes</th>
                <th className="border p-2 text-center">Chofer</th>
                <th className="border p-2 text-center">Ajuste</th>
                <th className="border p-2 text-center">Blancas</th>
                <th className="border p-2 text-center">Negras</th>
                <th className="border p-2 text-center">Verdes</th>
              </tr>
            </thead>
            <tbody>
              {datos.length === 0 ? (
                <tr>
                  <td
                    colSpan={16}
                    className="border p-4 text-center text-gray-500"
                  >
                    No hay datos para esta fecha
                  </td>
                </tr>
              ) : (
                datos.map((item) => (
                  <tr
                    key={item.centro_distribucion}
                    className={
                      item.alerta
                        ? "bg-red-100 hover:bg-red-200"
                        : "hover:bg-gray-100"
                    }
                  >
                    <td className="border p-2 font-semibold">
                      {item.centro_distribucion ?? "-"}
                    </td>
                    <td className="border p-2 font-semibold">
                      {item.almacen ?? "-"}
                    </td>
                    <td className="border p-2 text-center">
                      {item.chapa ?? "-"}
                    </td>
                    <td className="border p-2 text-center">
                      {item.expedicion?.nombre ?? "-"}
                    </td>
                    <td className="border p-2 text-center">
                      {item.expedicion?.ajuste || "-"}
                    </td>
                    <td className="border p-2 text-center">
                      {item.expedicion?.cajas?.blancas ?? "-"}
                    </td>
                    <td className="border p-2 text-center">
                      {item.expedicion?.cajas?.negras ?? "-"}
                    </td>
                    <td className="border p-2 text-center">
                      {item.expedicion?.cajas?.verdes ?? "-"}
                    </td>
                    <td className="border p-2 text-center">
                      {item.entrega?.nombre ?? "-"}
                    </td>
                    <td className="border p-2 text-center">
                      {item.entrega?.ajuste || "-"}
                    </td>
                    <td className="border p-2 text-center">
                      {item.entrega?.cajas?.blancas ?? "-"}
                    </td>
                    <td className="border p-2 text-center">
                      {item.entrega?.cajas?.negras ?? "-"}
                    </td>
                    <td className="border p-2 text-center">
                      {item.entrega?.cajas?.verdes ?? "-"}
                    </td>
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
