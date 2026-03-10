"use client";

import {
  Ajuste,
  Cajas,
  CentroDistribucion,
  Usuario,
  Vehiculo,
} from "@/lib/constants";
import { useState, useEffect } from "react";

interface FormularioEventoProps {
  usuario: Usuario;
  initialData?: any; // full event document when editing
  isAdjustment?: boolean;
  onAdjustmentSaved?: () => void; // callback when adjustment is saved
}

export default function FormularioEvento({
  usuario,
  initialData,
  isAdjustment = false,
  onAdjustmentSaved,
}: Readonly<FormularioEventoProps>) {
  // router not needed here
  const [tipoEvento, setTipoEvento] = useState<string>("");
  const [originalTipo, setOriginalTipo] = useState<string>("");
  const [originalId, setOriginalId] = useState<string | null>(null);
  const [almacenes, setAlmacenes] = useState<CentroDistribucion[]>([]);
  const [centros, setCentros] = useState<CentroDistribucion[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [formData, setFormData] = useState<{
    almacen?: string;
    centro_distribucion: string;
    fecha: string;
    chapa: string;
    cajas: Cajas;
    cajas_rotas: Cajas;
    tapas_rotas: Cajas;
    ajuste: Ajuste | null;
  }>({
    almacen: "",
    centro_distribucion: "",
    fecha: new Date().toISOString().split("T")[0],
    chapa: "",
    cajas: { blancas: 0, negras: 0, verdes: 0 },
    cajas_rotas: { blancas: 0, negras: 0, verdes: 0 },
    tapas_rotas: { blancas: 0, negras: 0, verdes: 0 },
    ajuste: null,
  });

  useEffect(() => {
    fetchAlmacenes();
    fetchCentros();
    fetchVehiculos();
  }, []);

  // populate when editing/adjustment
  useEffect(() => {
    if (initialData) {
      setOriginalTipo(initialData.tipo_evento || "");
      setOriginalId(initialData._id || null);
      // show ajuste mode
      setTipoEvento("Ajuste");
      setFormData({
        centro_distribucion: initialData.centro_distribucion || "",
        almacen: initialData.almacen || "",
        fecha: initialData.fecha || new Date().toISOString().split("T")[0],
        chapa: initialData.chapa || "",
        cajas: initialData.cajas || { blancas: 0, negras: 0, verdes: 0 },
        cajas_rotas: initialData.cajas_rotas || {
          blancas: 0,
          negras: 0,
          verdes: 0,
        },
        tapas_rotas: initialData.tapas_rotas || {
          blancas: 0,
          negras: 0,
          verdes: 0,
        },
        ajuste: initialData.ajuste || {
          nombre: usuario.nombre,
          cajas: { blancas: 0, negras: 0, verdes: 0 },
          cajas_rotas: { blancas: 0, negras: 0, verdes: 0 },
          tapas_rotas: { blancas: 0, negras: 0, verdes: 0 },
        },
      });
    }
  }, [initialData]);

  const fetchAlmacenes = async () => {
    try {
      const response = await fetch("/api/almacenes");
      const data = await response.json();
      setAlmacenes(data);
    } catch (error) {
      console.error("Error fetching almacenes:", error);
    }
  };

  const fetchCentros = async () => {
    try {
      const response = await fetch("/api/centros");
      const data = await response.json();
      setCentros(data);
    } catch (error) {
      console.error("Error fetching centros:", error);
    }
  };

  const fetchVehiculos = async () => {
    try {
      const response = await fetch("/api/vehiculos");
      const data = await response.json();
      setVehiculos(data);
    } catch (error) {
      console.error("Error fetching vehiculos:", error);
    }
  };

  const handleSelectEvento = (tipo: string) => {
    setTipoEvento(tipo);
    setMensaje("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    // parseInt supports negatives; fallback to 0 when NaN
    const numValue = Number.parseInt(value, 10);

    // Ajuste fields have a prefix that includes "ajuste_" followed by the
    // category (cajas / cajas_rotas / tapas_rotas) and finally the color.
    if (name.startsWith("ajuste_")) {
      const parts = name.split("_");
      // last part is color, the rest after "ajuste" defines the category
      const color = parts.at(-1);
      const category = parts.slice(1, -1).join("_") as
        | "cajas"
        | "cajas_rotas"
        | "tapas_rotas";

      setFormData((prev) => {
        const baseAjuste = prev.ajuste || {
          cajas: { blancas: 0, negras: 0, verdes: 0 },
          cajas_rotas: { blancas: 0, negras: 0, verdes: 0 },
          tapas_rotas: { blancas: 0, negras: 0, verdes: 0 },
        };
        return {
          ...prev,
          ajuste: {
            ...baseAjuste,
            [category]: {
              ...baseAjuste[category],
              [color!]: numValue || 0,
            },
          },
        };
      });
      setMensaje("");
      return;
    }

    if (numValue < 0) {
      setMensaje("Los valores no pueden ser negativos");
      return;
    }

    if (name.startsWith("tapas_rotas_")) {
      const [, , color] = name.split("_");
      const colorKey = color as keyof typeof formData.cajas;
      if (numValue > formData.cajas[colorKey]) {
        setMensaje(
          `Las tapas ${color} rotas no pueden ser más que el total de cajas ${color}`,
        );
        return;
      }
      setFormData((prev) => ({
        ...prev,
        tapas_rotas: { ...prev.tapas_rotas, [color]: numValue || 0 },
      }));
      setMensaje("");
    } else if (name.startsWith("cajas_rotas_")) {
      const [, , color] = name.split("_");
      const colorKey = color as keyof typeof formData.cajas;
      if (numValue > formData.cajas[colorKey]) {
        setMensaje(
          `Las cajas ${color} rotas no pueden ser más que el total de cajas ${color}`,
        );
        return;
      }
      setFormData((prev) => ({
        ...prev,
        cajas_rotas: { ...prev.cajas_rotas, [color]: numValue || 0 },
      }));
      setMensaje("");
    } else if (name.startsWith("cajas_")) {
      const [, color] = name.split("_");
      setFormData((prev) => ({
        ...prev,
        cajas: { ...prev.cajas, [color]: numValue || 0 },
      }));
      setMensaje("");
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (isAdjustment && originalTipo && originalId) {
        response = await fetch("/api/eventos/ajuste", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tipo_evento: originalTipo,
            id: originalId,
            ajuste: formData.ajuste,
            nombre: usuario.nombre,
          }),
        });
      } else {
        response = await fetch("/api/eventos/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tipo_evento: tipoEvento,
            ...formData,
            nombre: usuario.nombre,
          }),
        });
      }

      const data = await response.json();

      if (response.ok) {
        setMensaje(
          isAdjustment
            ? "Ajuste guardado exitosamente"
            : "Evento creado exitosamente",
        );
        if (!isAdjustment) {
          setTipoEvento("");
          setFormData({
            almacen: "",
            centro_distribucion: "",
            fecha: new Date().toISOString().split("T")[0],
            chapa: "",
            cajas: { blancas: 0, negras: 0, verdes: 0 },
            cajas_rotas: { blancas: 0, negras: 0, verdes: 0 },
            tapas_rotas: { blancas: 0, negras: 0, verdes: 0 },
            ajuste: null,
          });
        } else if (isAdjustment && onAdjustmentSaved) {
          setTimeout(() => {
            onAdjustmentSaved();
          }, 1500);
        }
        setTimeout(() => {
          setMensaje("");
        }, 3000);
      } else {
        setMensaje(data.error || "Error al procesar");
      }
    } catch (error) {
      setMensaje("Error en el servidor");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const opcionesEvento = (() => {
    switch (usuario.rol) {
      case "chofer":
        return ["Entrega", "Recogida"];
      case "expedidor":
        return ["Expedicion"];
      case "almacenero":
        return ["Devolucion"];
      default:
        return [];
    }
  })();

  const mostrarChofer = ["Entrega", "Recogida"].includes(tipoEvento);
  const mostrarRoturas = ["Recogida", "Devolucion"].includes(tipoEvento);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {isAdjustment ? "Ajustar Evento" : "Nuevo Evento"}
      </h2>

      {!isAdjustment && opcionesEvento.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
          No tienes permisos para crear eventos
        </div>
      ) : (
        <>
          {!tipoEvento && !isAdjustment ? (
            <div className="space-y-3">
              <p className="text-gray-700 font-semibold mb-4">
                Selecciona el tipo de evento:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {opcionesEvento.map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => handleSelectEvento(tipo)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded transition"
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-4">
                {!isAdjustment && (
                  <button
                    type="button"
                    onClick={() => setTipoEvento("")}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    ← Cambiar tipo de evento
                  </button>
                )}
              </div>

              {!mostrarChofer && (
                <div>
                  <label
                    htmlFor="almacen"
                    className="block text-gray-700 font-semibold mb-2"
                  >
                    Almacén *
                  </label>
                  <select
                    id="almacen"
                    name="almacen"
                    value={formData.almacen}
                    onChange={handleInputChange}
                    required
                    disabled={isAdjustment}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona un almacén</option>
                    {almacenes.map((almacen) => (
                      <option key={almacen._id} value={almacen.nombre}>
                        {almacen.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label
                  htmlFor="centro_distribucion"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Centro de distribución *
                </label>
                <select
                  id="centro_distribucion"
                  name="centro_distribucion"
                  value={formData.centro_distribucion}
                  onChange={handleInputChange}
                  required
                  disabled={isAdjustment}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona un centro</option>
                  {centros.map((centro) => (
                    <option key={centro._id} value={centro.nombre}>
                      {centro.nombre +
                        (tipoEvento === "Recogida"
                          ? " (deuda: " +
                            centro.deuda.blancas +
                            centro.deuda.negras +
                            centro.deuda.verdes +
                            ")"
                          : "")}
                    </option>
                  ))}
                </select>
              </div>

              {mostrarChofer && (
                <div>
                  <label
                    htmlFor="chapa"
                    className="block text-gray-700 font-semibold mb-2"
                  >
                    Chapa *
                  </label>
                  <select
                    id="chapa"
                    name="chapa"
                    value={formData.chapa}
                    onChange={handleInputChange}
                    required
                    disabled={isAdjustment}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona una chapa</option>
                    {vehiculos.map((vehiculo) => (
                      <option key={vehiculo._id} value={vehiculo.chapa}>
                        {vehiculo.categoria}{" "}
                        {vehiculo.marca ? vehiculo.marca + " " : ""}
                        {vehiculo.modelo ? vehiculo.modelo + " " : ""}-{" "}
                        {vehiculo.chapa}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formCajas(
                formData.cajas,
                "Total de Cajas",
                "cajas",
                isAdjustment,
              )}

              {mostrarRoturas &&
                formCajas(
                  formData.cajas_rotas,
                  "Cajas Rotas",
                  "cajas_rotas",
                  isAdjustment,
                )}

              {mostrarRoturas &&
                formCajas(
                  formData.tapas_rotas,
                  "Tapas Rotas",
                  "tapas_rotas",
                  isAdjustment,
                )}

              {isAdjustment && (
                <div>
                  {formCajas(
                    formData.ajuste?.cajas || {
                      blancas: 0,
                      negras: 0,
                      verdes: 0,
                    },
                    "Ajuste Total de Cajas",
                    "ajuste_cajas",
                  )}

                  {mostrarRoturas &&
                    formCajas(
                      formData.ajuste?.cajas_rotas || {
                        blancas: 0,
                        negras: 0,
                        verdes: 0,
                      },
                      "Ajuste Cajas Rotas",
                      "ajuste_cajas_rotas",
                    )}

                  {mostrarRoturas &&
                    formCajas(
                      formData.ajuste?.tapas_rotas || {
                        blancas: 0,
                        negras: 0,
                        verdes: 0,
                      },
                      "Ajuste Tapas Rotas",
                      "ajuste_tapas_rotas",
                    )}
                </div>
              )}

              {mensaje && (
                <div
                  className={`p-3 rounded ${mensaje.includes("exitosamente") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {mensaje}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={
                  "w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition"
                }
              >
                {loading
                  ? "Guardando..."
                  : "Guardar" + (isAdjustment ? " Ajuste" : "")}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );

  function formCajas(
    object: { blancas: number; negras: number; verdes: number },
    title: string,
    prefix: string,
    disabled = false,
  ) {
    return (
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="grid grid-cols-2 gap-2">
            <label
              htmlFor={`${prefix}_blancas`}
              className="border border-gray-500 bg-white text-gray-800 font-bold py-2 px-3 rounded flex items-center justify-center text-center"
            >
              Blancas
            </label>
            <input
              type="number"
              id={`${prefix}_blancas`}
              name={`${prefix}_blancas`}
              value={object.blancas}
              onChange={handleInputChange}
              disabled={disabled}
              className={
                (object.blancas === 0
                  ? "border-gray-300 "
                  : "border-gray-500 ") +
                "w-full px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label
              htmlFor={`${prefix}_negras`}
              className="border border-gray-500 bg-gray-800 text-white font-bold py-2 px-3 rounded flex items-center justify-center text-center"
            >
              Negras
            </label>
            <input
              type="number"
              id={`${prefix}_negras`}
              name={`${prefix}_negras`}
              value={object.negras}
              onChange={handleInputChange}
              disabled={disabled}
              className={
                (object.negras === 0
                  ? "border-gray-300 "
                  : "border-gray-500 ") +
                "w-full px-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label
              htmlFor={`${prefix}_verdes`}
              className="border border-gray-500 bg-green-100 text-green-800 font-bold py-2 px-3 rounded flex items-center justify-center text-center"
            >
              Verdes
            </label>
            <input
              type="number"
              id={`${prefix}_verdes`}
              name={`${prefix}_verdes`}
              value={object.verdes}
              onChange={handleInputChange}
              disabled={disabled}
              className={
                (object.verdes === 0
                  ? "border-gray-300 "
                  : "border-gray-500 ") +
                "w-full px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" +
                (prefix.includes("tapas") ? " hidden" : "")
              }
            />
          </div>
        </div>
      </div>
    );
  }
}
