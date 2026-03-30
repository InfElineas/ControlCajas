import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth";

const ROLES_VALIDOS = new Set(["informatico", "chofer", "almacenero", "expedidor"]);

export async function POST(request: NextRequest) {
  try {
    const { nombre, contrasena, rol } = await request.json();

    if (!nombre || !contrasena || !rol) {
      return NextResponse.json(
        { error: "Nombre, contraseña y rol son requeridos" },
        { status: 400 },
      );
    }

    if (!ROLES_VALIDOS.has(rol)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const usuarios = db.collection("Usuario");

    const usuarioExistente = await usuarios.findOne({ nombre });
    if (usuarioExistente) {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(contrasena);

    const resultado = await usuarios.insertOne({
      nombre,
      contrasena: hashedPassword,
      rol,
      habilitado: false,
    });

    return NextResponse.json({
      success: true,
      usuario: {
        id: resultado.insertedId.toString(),
        nombre,
        rol,
        habilitado: false,
      },
      message:
        "Usuario registrado correctamente. Tu cuenta debe ser autorizada por un administrador antes de iniciar sesión.",
    });
  } catch (error) {
    console.error("Registro error:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 },
    );
  }
}
