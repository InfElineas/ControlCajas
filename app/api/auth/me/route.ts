import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const usuarioCookie = request.cookies.get("usuario");

    if (!usuarioCookie) {
      return NextResponse.json(
        { error: "No estás autenticado" },
        { status: 401 },
      );
    }

    const usuario = JSON.parse(usuarioCookie.value);

    return NextResponse.json({
      success: true,
      usuario,
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 },
    );
  }
}
