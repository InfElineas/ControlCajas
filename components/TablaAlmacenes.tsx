"use client";

import { useState, useEffect } from "react";
import { Almacen, Usuario } from "@/lib/constants";

export default function TablaAlmacenes({
  usuario,
}: Readonly<{ usuario: Usuario }>) {
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<Partial<any>>({
    nombre: "",
    stock_blancas: 0,
    stock_negras: 0,
    stock_verdes: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAlmacenes();
  }, []);

  const fetchAlmacenes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/almacenes");
      const data = await res.json();
      if (res.ok) {
        setAlmacenes(data);
      } else {
        setError(data.error || "Error al cargar almacenes");
      }
    } catch {
      setError("Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ nombre: "", stock_blancas: 0, stock_negras: 0, stock_verdes: 0 });
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
        stock: {
          blancas: Number(form.stock_blancas) || 0,
          negras: Number(form.stock_negras) || 0,
          verdes: Number(form.stock_verdes) || 0,
        },
        ajuste: editingId ? usuario.nombre : undefined,
      };
      const res = await fetch("/api/almacenes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        resetForm();
        fetchAlmacenes();
      } else {
        setError(data.error || "Error en la operación");
      }
    } catch {
      setError("Error en el servidor");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (a: Almacen) => {
    const transformed = {
      nombre: a.nombre,
      stock_blancas: a.stock?.blancas || 0,
      stock_negras: a.stock?.negras || 0,
      stock_verdes: a.stock?.verdes || 0,
    };
    setForm(transformed);
    setEditingId(a._id);
  };

  const handleDelete = async (almacen: Almacen) => {
    if (!confirm("¿Eliminar el almacén " + almacen.nombre + "?")) return;
    try {
      const res = await fetch(`/api/almacenes?id=${almacen._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchAlmacenes();
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
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Almacenes</h2>
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
            <label htmlFor="stock_blancas" className="block text-gray-700">
              Stock (blancas)
            </label>
            <input
              id="stock_blancas"
              name="stock_blancas"
              type="number"
              value={form.stock_blancas}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="stock_negras" className="block text-gray-700">
              Stock (negras)
            </label>
            <input
              id="stock_negras"
              name="stock_negras"
              type="number"
              value={form.stock_negras}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="stock_verdes" className="block text-gray-700">
              Stock (verdes)
            </label>
            <input
              id="stock_verdes"
              name="stock_verdes"
              type="number"
              value={form.stock_verdes}
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
            {editingId ? "Guardar cambios" : "Agregar almacén"}
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
                <th className="border p-2 text-left">Stock (blancas)</th>
                <th className="border p-2 text-left">Stock (negras)</th>
                <th className="border p-2 text-left">Stock (verdes)</th>
                <th className="border p-2 text-center">Editado por</th>
                <th className="border p-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {almacenes.map((a) => (
                <tr key={a._id} className="hover:bg-gray-100">
                  <td className="border p-2">{a.nombre}</td>
                  <td className="border p-2">{a.stock.blancas ?? 0}</td>
                  <td className="border p-2">{a.stock.negras ?? 0}</td>
                  <td className="border p-2">{a.stock.verdes ?? 0}</td>
                  <td className="border p-2">{a.ajuste || "-"}</td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => startEdit(a)}
                      className="text-blue-600 hover:underline mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(a)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {almacenes.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="border p-4 text-center text-gray-500"
                  >
                    No hay almacenes registrados
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
