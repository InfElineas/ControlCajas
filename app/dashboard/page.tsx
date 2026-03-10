"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import FormularioEvento from "@/components/FormularioEvento";
import TablaExpedicionEntrega, {
  ItemExpedicionEntrega,
} from "@/components/TablaExpedicionEntrega";
import TablaRecogidaDevolucion, {
  ItemRecogidaDevolucion,
} from "@/components/TablaRecogidaDevolucion";
import TablaExpedicion from "@/components/TablaExpedicion";
import TablaEntrega from "@/components/TablaEntrega";
import TablaDevolucion from "@/components/TablaDevolucion";
import TablaRecogida from "@/components/TablaRecogida";
import TablaVehiculos from "@/components/TablaVehiculos";
import TablaAlmacenes from "@/components/TablaAlmacenes";
import TablaCentros from "@/components/TablaCentros";
import { Usuario } from "@/lib/constants";
import CierreDiario from "@/components/CierreDiario";
import TablaUsuarios from "@/components/TablaUsuarios";

interface Evento {
  _id: string;
  tipo_evento: string;
  [key: string]: unknown;
}

export default function Dashboard() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [activeTab, setActiveTab] = useState<
    "eventos" | "mis_eventos" | "ver_eventos" | "administracion"
  >(usuario?.rol === "informatico" ? "ver_eventos" : "mis_eventos");
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [adjustingEvent, setAdjustingEvent] = useState<Evento | null>(null);
  const [expedicionData, setExpedicionData] = useState<ItemExpedicionEntrega[]>(
    [],
  );
  const [recogidaData, setRecogidaData] = useState<ItemRecogidaDevolucion[]>(
    [],
  );

  useEffect(() => {
    // Obtener usuario desde el servidor
    const fetchUsuario = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (response.ok && data.usuario) {
          setUsuario(data.usuario);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [router]);

  if (loading || !usuario) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  const handleAjustarClick = async (tipoEvento: string, eventoId: string) => {
    try {
      const res = await fetch(
        `/api/eventos/get?tipo=${tipoEvento}&id=${eventoId}`,
      );
      const evento = await res.json();
      if (res.ok) {
        setAdjustingEvent({ ...evento, tipo_evento: tipoEvento });
      }
    } catch (error) {
      console.error("Error fetching event:", error);
    }
  };

  function renderView() {
    switch (activeTab) {
      case "eventos":
        return usuario?.rol === "informatico" ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
            Los informáticos no pueden crear eventos
          </div>
        ) : (
          <FormularioEvento usuario={usuario!} />
        );
      case "mis_eventos":
        return (
          <div className="space-y-8">
            {/* Mostrar 4 tablas separadas. La API limitará por usuario si no es informático */}
            <div className="bg-white rounded-lg shadow p-6">
              <div>
                <label
                  htmlFor="fechaRender"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Fecha
                </label>
                <input
                  id="fechaRender"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {(usuario?.rol === "informatico" ||
                usuario?.rol === "expedidor") && (
                <TablaExpedicion
                  usuario={usuario}
                  fecha={fecha}
                  onAjustar={handleAjustarClick}
                />
              )}
              {(usuario?.rol === "informatico" ||
                usuario?.rol === "chofer") && (
                <TablaEntrega
                  usuario={usuario}
                  fecha={fecha}
                  onAjustar={handleAjustarClick}
                />
              )}
              {(usuario?.rol === "informatico" ||
                usuario?.rol === "chofer") && (
                <TablaRecogida
                  usuario={usuario}
                  fecha={fecha}
                  onAjustar={handleAjustarClick}
                />
              )}
              {(usuario?.rol === "informatico" ||
                usuario?.rol === "almacenero") && (
                <TablaDevolucion
                  usuario={usuario}
                  fecha={fecha}
                  onAjustar={handleAjustarClick}
                />
              )}
              {/*TODO: Transferencias*/}
            </div>
          </div>
        );
      case "ver_eventos":
        return usuario?.rol === "informatico" ? (
          <div className="space-y-8 bg-white rounded-lg shadow p-6">
            <div>
              <label
                htmlFor="fechaRender"
                className="block text-gray-700 font-semibold mb-2"
              >
                Fecha
              </label>
              <input
                id="fechaRender"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <TablaExpedicionEntrega
              fecha={fecha}
              datos={expedicionData}
              setDatos={setExpedicionData}
            />
            <TablaRecogidaDevolucion
              fecha={fecha}
              datos={recogidaData}
              setDatos={setRecogidaData}
            />
            <CierreDiario
              fecha={fecha}
              expedicionData={expedicionData}
              recogidaData={recogidaData}
            />
          </div>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
            Sólo los informáticos pueden ver los eventos
          </div>
        );
      case "administracion":
        return usuario?.rol === "informatico" ? (
          <div className="space-y-8 bg-white rounded-lg shadow p-6">
            <TablaVehiculos usuario={usuario} />
            <TablaAlmacenes usuario={usuario} />
            <TablaCentros usuario={usuario} />
            <TablaUsuarios usuario={usuario} />
          </div>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
            Sólo los informáticos pueden administrar los datos
          </div>
        );
      default:
        return (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
            Esta vista aún no ha sido implementada
          </div>
        );
    }
  }

  return (
    <>
      <Header usuario={usuario} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex gap-4 border-b">
            {usuario.rol !== "informatico" && (
              <button
                onClick={() => setActiveTab("eventos")}
                className={`px-4 py-2 font-semibold border-b-2 transition ${
                  activeTab === "eventos"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
              >
                Nuevo Evento
              </button>
            )}
            <button
              onClick={() => setActiveTab("mis_eventos")}
              className={`px-4 py-2 font-semibold border-b-2 transition ${
                activeTab === "mis_eventos"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              {usuario.rol === "informatico"
                ? "Eventos del día"
                : "Mis Eventos"}
            </button>
            {usuario.rol === "informatico" && (
              <>
                <button
                  onClick={() => setActiveTab("ver_eventos")}
                  className={`px-4 py-2 font-semibold border-b-2 transition ${
                    activeTab === "ver_eventos"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Resumen de Eventos
                </button>
                <button
                  onClick={() => setActiveTab("administracion")}
                  className={`px-4 py-2 font-semibold border-b-2 transition ${
                    activeTab === "administracion"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Administración
                </button>
              </>
            )}
          </div>
        </div>

        {renderView()}
      </div>

      {/* Modal overlay para ajustes */}
      {adjustingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b p-4 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">
                Ajustar Evento
              </h2>
              <button
                onClick={() => setAdjustingEvent(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <FormularioEvento
                usuario={usuario}
                initialData={adjustingEvent}
                isAdjustment={true}
                onAdjustmentSaved={() => setAdjustingEvent(null)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
