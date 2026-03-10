"use client";

import { useState, useEffect } from "react";
import { Cierre, Cajas } from "@/lib/constants";
import { ItemExpedicionEntrega } from "./TablaExpedicionEntrega";
import { ItemRecogidaDevolucion } from "./TablaRecogidaDevolucion";

export default function CierreDiario({
  fecha,
  expedicionData,
  recogidaData,
}: Readonly<{
  fecha: string;
  expedicionData: ItemExpedicionEntrega[];
  recogidaData: ItemRecogidaDevolucion[];
}>) {
  const [cierre, setCierre] = useState<Cierre>({
    fecha: fecha,
    cierre_cd: [],
    cierre_almacen: [],
  });
  const [existente, setExistente] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDatos();
  }, [fecha]);

  useEffect(() => {
    if (!loading && !existente) {
      setCierre(nuevoCierre());
    }
  }, [expedicionData, recogidaData]);

  const fetchDatos = async () => {
    setLoading(true);
    setExistente(false);
    setError("");
    try {
      // Obtener datos de comparación
      const respCierre = await fetch(`/api/cierre?fecha=${fecha}`);
      const dataCierre = await respCierre.json();

      if (respCierre.ok && dataCierre) {
        setCierre(dataCierre);
        setExistente(true);
      } else if (!respCierre.ok) {
        const errData = await respCierre.json();
        setError(errData.error || "Error al cargar cierre");
      }
    } catch (err) {
      setError("Error al cargar datos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nuevoCierre = (): Cierre => {
    return {
      fecha,
      cierre_cd: Object.entries(calcularAjustesDeuda()).map(([cd, data]) => ({
        centro_distribucion: cd,
        ajuste_deuda: data.cajas,
        cajas_rotas: data.roturas,
        tapas_rotas: data.roturas,
      })),
      cierre_almacen: Object.entries(calcularAjustesStock()).map(
        ([almacen, cajas]) => ({
          almacen,
          ajuste_stock: cajas,
        }),
      ),
    };
  };

  const tieneAlertas = (): boolean => {
    if (expedicionData)
      for (const item of expedicionData) {
        if (item.alerta) return true;
      }
    if (recogidaData)
      for (const item of recogidaData) {
        if (item.alerta) return true;
      }
    return false;
  };

  const calcularAjustesStock = () => {
    const ajustesMap: Record<string, Cajas> = {};

    // Sumar cajas de Devolución (incrementan stock)
    recogidaData.forEach((item: ItemRecogidaDevolucion) => {
      if (item.devolucion?.cajas) {
        if (!ajustesMap[item.almacen]) {
          ajustesMap[item.almacen] = { blancas: 0, negras: 0, verdes: 0 };
        }
        ajustesMap[item.almacen].blancas += item.devolucion.cajas.blancas ?? 0;
        ajustesMap[item.almacen].negras += item.devolucion.cajas.negras ?? 0;
        ajustesMap[item.almacen].verdes += item.devolucion.cajas.verdes ?? 0;
      }
    });

    // Restar cajas de Expedición (disminuyen stock)
    expedicionData.forEach((item: ItemExpedicionEntrega) => {
      if (item.expedicion?.cajas) {
        if (!ajustesMap[item.almacen]) {
          ajustesMap[item.almacen] = { blancas: 0, negras: 0, verdes: 0 };
        }
        ajustesMap[item.almacen].blancas -= item.expedicion.cajas.blancas ?? 0;
        ajustesMap[item.almacen].negras -= item.expedicion.cajas.negras ?? 0;
        ajustesMap[item.almacen].verdes -= item.expedicion.cajas.verdes ?? 0;
      }
    });

    return ajustesMap;
  };

  const calcularAjustesDeuda = () => {
    const ajustesMap: Record<string, { cajas: Cajas; roturas: Cajas }> = {};

    // Sumar cajas de Entrega (incrementan deuda)
    expedicionData.forEach((item: ItemExpedicionEntrega) => {
      if (item.entrega?.cajas) {
        if (!ajustesMap[item.centro_distribucion]) {
          ajustesMap[item.centro_distribucion] = {
            cajas: { blancas: 0, negras: 0, verdes: 0 },
            roturas: { blancas: 0, negras: 0, verdes: 0 },
          };
        }
        ajustesMap[item.centro_distribucion].cajas.blancas +=
          item.entrega.cajas.blancas ?? 0;
        ajustesMap[item.centro_distribucion].cajas.negras +=
          item.entrega.cajas.negras ?? 0;
        ajustesMap[item.centro_distribucion].cajas.verdes +=
          item.entrega.cajas.verdes ?? 0;
      }
    });

    // Restar cajas de Recogida (disminuyen deuda)
    recogidaData.forEach((item: ItemRecogidaDevolucion) => {
      if (item.recogida?.cajas) {
        if (!ajustesMap[item.centro_distribucion]) {
          ajustesMap[item.centro_distribucion] = {
            cajas: { blancas: 0, negras: 0, verdes: 0 },
            roturas: { blancas: 0, negras: 0, verdes: 0 },
          };
        }
        ajustesMap[item.centro_distribucion].cajas.blancas -=
          item.recogida.cajas.blancas ?? 0;
        ajustesMap[item.centro_distribucion].cajas.negras -=
          item.recogida.cajas.negras ?? 0;
        ajustesMap[item.centro_distribucion].cajas.verdes -=
          item.recogida.cajas.verdes ?? 0;
      }

      // Agregar roturas
      if (item.recogida?.cajas_rotas || item.recogida?.tapas_rotas) {
        if (!ajustesMap[item.centro_distribucion]) {
          ajustesMap[item.centro_distribucion] = {
            cajas: { blancas: 0, negras: 0, verdes: 0 },
            roturas: { blancas: 0, negras: 0, verdes: 0 },
          };
        }
        const cajas_rotas = item.recogida?.cajas_rotas ?? {
          blancas: 0,
          negras: 0,
          verdes: 0,
        };
        const tapas_rotas = item.recogida?.tapas_rotas ?? {
          blancas: 0,
          negras: 0,
          verdes: 0,
        };
        ajustesMap[item.centro_distribucion].roturas.blancas +=
          (cajas_rotas.blancas ?? 0) + (tapas_rotas.blancas ?? 0);
        ajustesMap[item.centro_distribucion].roturas.negras +=
          (cajas_rotas.negras ?? 0) + (tapas_rotas.negras ?? 0);
        ajustesMap[item.centro_distribucion].roturas.verdes +=
          (cajas_rotas.verdes ?? 0) + (tapas_rotas.verdes ?? 0);
      }
    });

    return ajustesMap;
  };

  const handleCrearCierre = async () => {
    const confirmar = globalThis.confirm(
      `¿Deseas crear el Cierre para el día ${fecha}? Esta acción no se puede deshacer.`,
    );
    if (!confirmar) return;

    setLoading(true);
    try {
      const response = await fetch("/api/cierre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cierre),
      });

      if (response.ok) {
        const nuevoCierre = await response.json();
        setCierre(nuevoCierre);
        setExistente(true);
        setError("");
      } else {
        const errData = await response.json();
        setError(errData.error || "Error al crear cierre");
      }
    } catch (err) {
      setError("Error al crear cierre");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Cierre Diario</h2>
      {error && !loading && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {tieneAlertas() && !loading && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded mb-4">
          ⚠️ Existen inconsistencias en los datos. No se puede crear un nuevo
          cierre hasta que se resuelvan.
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="space-y-8">
          {existente ? (
            <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded mb-4">
              ✓ Día cerrado. No se pueden hacer más cambios.
            </div>
          ) : (
            <button
              onClick={handleCrearCierre}
              disabled={tieneAlertas() || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded mb-4"
            >
              {loading ? "Creando..." : "Crear Cierre"}
            </button>
          )}

          {/* Tabla de Almacenes */}
          <div>
            <h3 className="text-xl font-bold mb-3 text-gray-700">
              Almacenes - Ajuste de Stock
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2 text-left">Almacén</th>
                    <th className="border p-2 text-center">Blancas</th>
                    <th className="border p-2 text-center">Negras</th>
                    <th className="border p-2 text-center">Verdes</th>
                  </tr>
                </thead>
                <tbody>
                  {cierre.cierre_almacen.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="border p-4 text-center text-gray-500"
                      >
                        No hay datos
                      </td>
                    </tr>
                  ) : (
                    cierre.cierre_almacen.map((c) => (
                      <tr key={c.almacen} className="hover:bg-gray-100">
                        <td className="border p-2 font-semibold">
                          {c.almacen}
                        </td>
                        <td className={"border p-2 text-center"}>
                          {c.ajuste_stock.blancas}
                        </td>
                        <td className={"border p-2 text-center"}>
                          {c.ajuste_stock.negras}
                        </td>
                        <td className={"border p-2 text-center"}>
                          {c.ajuste_stock.verdes}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla de Centros de Distribución */}
          <div>
            <h3 className="text-xl font-bold mb-3 text-gray-700">
              Centros de Distribución - Ajuste de Deuda
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2 text-left">
                      Centro Distribución
                    </th>
                    <th
                      colSpan={3}
                      className="border p-2 text-center bg-blue-50"
                    >
                      Ajuste Deuda
                    </th>
                    <th
                      colSpan={2}
                      className="border p-2 text-center bg-rose-50"
                    >
                      Roturas
                    </th>
                  </tr>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left"></th>
                    <th className="border p-2 text-center">Blancas</th>
                    <th className="border p-2 text-center">Negras</th>
                    <th className="border p-2 text-center">Verdes</th>
                    <th className="border p-2 text-center">Cajas</th>
                    <th className="border p-2 text-center">Tapas</th>
                  </tr>
                </thead>
                <tbody>
                  {cierre.cierre_cd.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="border p-4 text-center text-gray-500"
                      >
                        No hay datos
                      </td>
                    </tr>
                  ) : (
                    cierre.cierre_cd.map((c) => (
                      <tr
                        key={c.centro_distribucion}
                        className="hover:bg-gray-100"
                      >
                        <td className="border p-2 font-semibold">
                          {c.centro_distribucion}
                        </td>
                        <td className={"border p-2 text-center"}>
                          {c.ajuste_deuda.blancas}
                        </td>
                        <td className={"border p-2 text-center"}>
                          {c.ajuste_deuda.negras}
                        </td>
                        <td className={"border p-2 text-center"}>
                          {c.ajuste_deuda.verdes}
                        </td>
                        <td
                          title={`Blancas: ${c.cajas_rotas.blancas}, Negras: ${c.cajas_rotas.negras}, Verdes: ${c.cajas_rotas.verdes}`}
                          className="border p-2 text-center"
                        >
                          {c.cajas_rotas.blancas +
                            c.cajas_rotas.negras +
                            c.cajas_rotas.verdes}
                        </td>
                        <td
                          title={`Blancas: ${c.tapas_rotas.blancas}, Negras: ${c.tapas_rotas.negras}, Verdes: ${c.tapas_rotas.verdes}`}
                          className="border p-2 text-center"
                        >
                          {c.tapas_rotas.blancas +
                            c.tapas_rotas.negras +
                            c.tapas_rotas.verdes}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
