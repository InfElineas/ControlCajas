import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { comparePassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { nombre, contrasena } = await request.json();

    if (!nombre || !contrasena) {
      return NextResponse.json(
        { error: "Nombre y contraseña son requeridos" },
        { status: 400 },
      );
    }

    const { db } = await connectToDatabase();
    const usuarios = db.collection("Usuario");

    const usuario = await usuarios.findOne({ nombre });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 },
      );
    }

    if (!usuario.habilitado) {
      return NextResponse.json(
        {
          error:
            "Su usuario aún no ha sido autorizado, póngase en contacto con un administrador del sistema",
        },
        { status: 403 },
      );
    }

    const passwordMatch = await comparePassword(contrasena, usuario.contrasena);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 },
      );
    }

    const response = NextResponse.json({
      success: true,
      usuario: {
        id: usuario._id.toString(),
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    });

    response.cookies.set(
      "usuario",
      JSON.stringify({
        id: usuario._id.toString(),
        nombre: usuario.nombre,
        rol: usuario.rol,
      }),
      {
        httpOnly: true,
        maxAge: 86400,
        path: "/",
      },
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 },
    );
  }
}
