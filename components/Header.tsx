"use client";

import { Usuario } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface HeaderProps {
  usuario?: Usuario;
}

export default function Header({ usuario }: Readonly<HeaderProps>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="bg-gradient-to-r from-sky-400 to-sky-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold">ControlCajas</h1>
        {usuario && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold">{usuario.nombre}</p>
              <p className="text-blue-100 text-sm capitalize">{usuario.rol}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 px-4 py-2 rounded font-semibold transition"
            >
              {loading ? "Saliendo..." : "Salir"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
