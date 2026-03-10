"use client";

import { useState, useEffect } from "react";

export interface ItemRecogidaDevolucion {
  centro_distribucion: string;
  almacen: string;
  chapa: string;
  recogida: any;
  devolucion: any;
  alerta: boolean;
  rotura: boolean;
}

export default function TablaRecogidaDevolucion({
  fecha,
  datos = [],
  setDatos,
}: Readonly<{
  fecha: string;
  datos: ItemRecogidaDevolucion[];
  setDatos: (datos: ItemRecogidaDevolucion[]) => void;
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
        `/api/comparar?fecha=${fecha}&tipo=devolucion_recogida`,
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
        Recogida - Devolución
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
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th colSpan={3} className="border p-2 text-left">
                  Centro de Distribución
                </th>
                <th colSpan={5} className="border p-2 text-center bg-indigo-50">
                  Recogida
                </th>
                <th colSpan={5} className="border p-2 text-center bg-amber-50">
                  Devolución
                </th>
                <th colSpan={2} className="border p-2 text-center bg-rose-50">
                  Roturas
                </th>
              </tr>
              <tr className="bg-gray-100 text-xs">
                <th className="border p-1">CD</th>
                <th className="border p-1">Almacén</th>
                <th className="border p-1">Chapa</th>
                <th className="border p-1">Chofer</th>
                <th className="border p-1">Ajuste</th>
                <th className="border p-1">Blancas</th>
                <th className="border p-1">Negras</th>
                <th className="border p-1">Verdes</th>
                <th className="border p-1">Almacenero</th>
                <th className="border p-1">Ajuste</th>
                <th className="border p-1">Blancas</th>
                <th className="border p-1">Negras</th>
                <th className="border p-1">Verdes</th>
                <th className="border p-1">R. Recogida</th>
                <th className="border p-1">R. Devolución</th>
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
                        : item.rotura
                          ? "bg-yellow-100 hover:bg-yellow-200"
                          : "hover:bg-gray-100"
                    }
                  >
                    <td className="border p-2 font-semibold text-sm">
                      {item.centro_distribucion ?? "-"}
                    </td>
                    <td className="border p-2 font-semibold text-sm">
                      {item.almacen ?? "-"}
                    </td>
                    <td className="border p-2 text-center">
                      {item.chapa ?? "-"}
                    </td>
                    {/* Rec. Cajas */}
                    <td className="border p-1 text-center text-xs">
                      {item.recogida?.nombre ?? "-"}
                    </td>
                    <td className="border p-1 text-center text-xs">
                      {item.recogida?.ajuste || "-"}
                    </td>
                    <td className="border p-1 text-center text-xs">
                      {item.recogida?.cajas?.blancas ?? "-"}
                    </td>
                    <td className="border p-1 text-center text-xs">
                      {item.recogida?.cajas?.negras ?? "-"}
                    </td>
                    <td className="border p-1 text-center text-xs">
                      {item.recogida?.cajas?.verdes ?? "-"}
                    </td>
                    {/* Dev. Cajas */}
                    <td className="border p-1 text-center text-xs">
                      {item.devolucion?.nombre ?? "-"}
                    </td>
                    <td className="border p-1 text-center text-xs">
                      {item.devolucion?.ajuste || "-"}
                    </td>
                    <td className="border p-1 text-center text-xs">
                      {item.devolucion?.cajas?.blancas ?? "-"}
                    </td>
                    <td className="border p-1 text-center text-xs">
                      {item.devolucion?.cajas?.negras ?? "-"}
                    </td>
                    <td className="border p-1 text-center text-xs">
                      {item.devolucion?.cajas?.verdes ?? "-"}
                    </td>
                    <td
                      className="border p-1 text-center text-xs"
                      title={
                        item.recogida
                          ? `Cajas rotas — blancas: ${item.recogida.cajas_rotas?.blancas ?? 0}, negras: ${item.recogida.cajas_rotas?.negras ?? 0}, verdes: ${item.recogida.cajas_rotas?.verdes ?? 0}\nTapas rotas — blancas: ${item.recogida.tapas_rotas?.blancas ?? 0}, negras: ${item.recogida.tapas_rotas?.negras ?? 0}, verdes: ${item.recogida.tapas_rotas?.verdes ?? 0}`
                          : undefined
                      }
                    >
                      {item.recogida
                        ? (item.recogida.cajas_rotas?.blancas ?? 0) +
                          (item.recogida.cajas_rotas?.negras ?? 0) +
                          (item.recogida.cajas_rotas?.verdes ?? 0) +
                          (item.recogida.tapas_rotas?.blancas ?? 0) +
                          (item.recogida.tapas_rotas?.negras ?? 0) +
                          (item.recogida.tapas_rotas?.verdes ?? 0)
                        : "-"}
                    </td>
                    <td
                      className="border p-1 text-center text-xs"
                      title={
                        item.devolucion
                          ? `Cajas rotas — blancas: ${item.devolucion.cajas_rotas?.blancas ?? 0}, negras: ${item.devolucion.cajas_rotas?.negras ?? 0}, verdes: ${item.devolucion.cajas_rotas?.verdes ?? 0}\nTapas rotas — blancas: ${item.devolucion.tapas_rotas?.blancas ?? 0}, negras: ${item.devolucion.tapas_rotas?.negras ?? 0}, verdes: ${item.devolucion.tapas_rotas?.verdes ?? 0}`
                          : undefined
                      }
                    >
                      {item.devolucion
                        ? (item.devolucion.cajas_rotas?.blancas ?? 0) +
                          (item.devolucion.cajas_rotas?.negras ?? 0) +
                          (item.devolucion.cajas_rotas?.verdes ?? 0) +
                          (item.devolucion.tapas_rotas?.blancas ?? 0) +
                          (item.devolucion.tapas_rotas?.negras ?? 0) +
                          (item.devolucion.tapas_rotas?.verdes ?? 0)
                        : "-"}
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
