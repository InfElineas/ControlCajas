"use client";

import { useState, useEffect } from "react";
import { Usuario, Vehiculo } from "@/lib/constants";

export default function TablaVehiculos({
  usuario,
}: Readonly<{ usuario: Usuario }>) {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<Partial<Vehiculo>>({
    chapa: "",
    marca: "",
    modelo: "",
    categoria: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVehiculos();
  }, []);

  const fetchVehiculos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vehiculos");
      const data = await res.json();
      if (res.ok) {
        setVehiculos(data);
      } else {
        setError(data.error || "Error al cargar vehículos");
      }
    } catch {
      setError("Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ chapa: "", marca: "", modelo: "", categoria: "" });
    setEditingId(null);
    setError("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // basic validation
    if (!form.chapa || !form.categoria) {
      setError("Chapa y categoría son requeridos");
      return;
    }
    setSubmitting(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId
        ? {
            _id: editingId,
            ...form,
            ajuste: editingId ? usuario.nombre : undefined,
          }
        : form;
      const res = await fetch("/api/vehiculos", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        resetForm();
        fetchVehiculos();
      } else {
        setError(data.error || "Error en la operación");
      }
    } catch {
      setError("Error en el servidor");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (v: Vehiculo) => {
    setForm(v);
    setEditingId(v._id);
  };

  const handleDelete = async (vehiculo: Vehiculo) => {
    if (!confirm("¿Eliminar el vehículo " + vehiculo.chapa + "?")) return;
    try {
      const res = await fetch(`/api/vehiculos?id=${vehiculo._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchVehiculos();
      } else {
        const data = await res.json();
        setError(data.error || "Error eliminando");
      }
    } catch {
      setError("Error en el servidor");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Vehículos</h2>
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-2 rounded">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="categoria" className="block text-gray-700">
              Categoría
            </label>
            <input
              id="categoria"
              name="categoria"
              required
              value={form.categoria || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="chapa" className="block text-gray-700">
              Chapa
            </label>
            <input
              id="chapa"
              name="chapa"
              required
              value={form.chapa || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="marca" className="block text-gray-700">
              Marca
            </label>
            <input
              id="marca"
              name="marca"
              value={form.marca || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="modelo" className="block text-gray-700">
              Modelo
            </label>
            <input
              id="modelo"
              name="modelo"
              value={form.modelo || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
        <div className="mt-2">
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 bg-blue-600 text-white rounded ${
              submitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {editingId ? "Guardar cambios" : "Agregar vehículo"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="ml-2 px-4 py-2 bg-gray-400 text-white rounded"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-left">Categoría</th>
                <th className="border p-2 text-left">Chapa</th>
                <th className="border p-2 text-left">Marca</th>
                <th className="border p-2 text-left">Modelo</th>
                <th className="border p-2 text-left">Editado por</th>
                <th className="border p-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v) => (
                <tr key={v._id} className="hover:bg-gray-100">
                  <td className="border p-2">{v.categoria ?? "-"}</td>
                  <td className="border p-2">{v.chapa ?? "-"}</td>
                  <td className="border p-2">{v.marca || "-"}</td>
                  <td className="border p-2">{v.modelo || "-"}</td>
                  <td className="border p-2">{v.ajuste || "-"}</td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => startEdit(v)}
                      className="text-blue-600 hover:underline mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(v)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {vehiculos.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="border p-4 text-center text-gray-500"
                  >
                    No hay vehículos registrados
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
