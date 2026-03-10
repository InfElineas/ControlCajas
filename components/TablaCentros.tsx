"use client";

import { useState, useEffect } from "react";
import { CentroDistribucion, Usuario } from "@/lib/constants";

export default function TablaCentros({
  usuario,
}: Readonly<{ usuario: Usuario }>) {
  const [centros, setCentros] = useState<CentroDistribucion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<Partial<any>>({
    nombre: "",
    deuda_blancas: 0,
    deuda_negras: 0,
    deuda_verdes: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCentros();
  }, []);

  const fetchCentros = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/centros");
      const data = await res.json();
      if (res.ok) {
        setCentros(data);
      } else {
        setError(data.error || "Error al cargar centros");
      }
    } catch {
      setError("Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ nombre: "", deuda_blancas: 0, deuda_negras: 0, deuda_verdes: 0 });
    setEditingId(null);
    setError("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre) {
      setError("Nombre es requerido");
      return;
    }
    setSubmitting(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const body = {
        _id: editingId || undefined,
        nombre: form.nombre,
        deuda: {
          blancas: Number(form.deuda_blancas) || 0,
          negras: Number(form.deuda_negras) || 0,
          verdes: Number(form.deuda_verdes) || 0,
        },
        ajuste: editingId ? usuario.nombre : undefined,
      };
      const res = await fetch("/api/centros", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        resetForm();
        fetchCentros();
      } else {
        setError(data.error || "Error en la operación");
      }
    } catch {
      setError("Error en el servidor");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (c: CentroDistribucion) => {
    const transformed = {
      nombre: c.nombre,
      deuda_blancas: c.deuda?.blancas || 0,
      deuda_negras: c.deuda?.negras || 0,
      deuda_verdes: c.deuda?.verdes || 0,
    };
    setForm(transformed);
    setEditingId(c._id);
  };

  const handleDelete = async (centro: CentroDistribucion) => {
    if (!confirm("¿Eliminar el centro " + centro.nombre + "?")) return;
    try {
      const res = await fetch(`/api/centros?id=${centro._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchCentros();
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
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Centros de distribución
      </h2>
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-2 rounded">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nombre" className="block text-gray-700">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              value={form.nombre || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="deuda_blancas" className="block text-gray-700">
              Deuda (blancas)
            </label>
            <input
              id="deuda_blancas"
              name="deuda_blancas"
              type="number"
              value={form.deuda_blancas}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="deuda_negras" className="block text-gray-700">
              Deuda (negras)
            </label>
            <input
              id="deuda_negras"
              name="deuda_negras"
              type="number"
              value={form.deuda_negras}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="deuda_verdes" className="block text-gray-700">
              Deuda (verdes)
            </label>
            <input
              id="deuda_verdes"
              name="deuda_verdes"
              type="number"
              value={form.deuda_verdes}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="sm:cols-span-2">
            <label htmlFor="rotacion" className="block text-gray-700">
              Rotación (días)
            </label>
            <input
              id="rotacion"
              name="rotacion"
              type="number"
              value={form.rotacion || 0}
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
            {editingId ? "Guardar cambios" : "Agregar centro"}
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
                <th className="border p-2 text-left">Nombre</th>
                <th className="border p-2 text-left">Deuda (blancas)</th>
                <th className="border p-2 text-left">Deuda (negras)</th>
                <th className="border p-2 text-left">Deuda (verdes)</th>
                <th className="border p-2 text-left">Rotación (días)</th>
                <th className="border p-2 text-left">Editado por</th>
                <th className="border p-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {centros.map((c) => (
                <tr key={c._id} className="hover:bg-gray-100">
                  <td className="border p-2">{c.nombre}</td>
                  <td className="border p-2">{c.deuda.blancas ?? 0}</td>
                  <td className="border p-2">{c.deuda.negras ?? 0}</td>
                  <td className="border p-2">{c.deuda.verdes ?? 0}</td>
                  <td className="border p-2">{c.rotacion ?? 0}</td>
                  <td className="border p-2">{c.ajuste || "-"}</td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => startEdit(c)}
                      className="text-blue-600 hover:underline mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {centros.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="border p-4 text-center text-gray-500"
                  >
                    No hay centros registrados
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
