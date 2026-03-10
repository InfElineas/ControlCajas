import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      tipo_evento,
      centro_distribucion,
      almacen,
      fecha,
      nombre,
      cajas,
      chapa,
      cajas_rotas,
      tapas_rotas,
    } = data;

    if (!tipo_evento || !centro_distribucion || !fecha || !nombre) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // verificar rol del usuario en la cookie
    const usuarioCookie = request.cookies.get("usuario");
    if (!usuarioCookie) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    let usuario;
    try {
      usuario = JSON.parse(usuarioCookie.value);
    } catch {
      return NextResponse.json(
        { error: "Cookie de usuario inválida" },
        { status: 401 },
      );
    }

    const rol = usuario.rol;
    const tipo = tipo_evento;
    const permitido =
      (rol === "chofer" && (tipo === "Entrega" || tipo === "Recogida")) ||
      (rol === "expedidor" && tipo === "Expedicion") ||
      (rol === "almacenero" && tipo === "Devolucion");
    if (!permitido) {
      return NextResponse.json(
        { error: "Sin permiso para ese tipo de evento" },
        { status: 403 },
      );
    }

    const { db } = await connectToDatabase();
    let coleccion;
    let documento: any = {
      centro_distribucion,
      fecha,
      nombre,
      cajas: cajas || { blancas: 0, negras: 0, verdes: 0 },
    };

    if (tipo_evento === "Entrega" || tipo_evento === "Recogida") {
      documento.chapa = chapa;
      if (tipo_evento === "Recogida") {
        documento.cajas_rotas = cajas_rotas || {
          blancas: 0,
          negras: 0,
          verdes: 0,
        };
        documento.tapas_rotas = tapas_rotas || {
          blancas: 0,
          negras: 0,
          verdes: 0,
        };
      }
      coleccion = db.collection(tipo_evento);
    } else if (tipo_evento === "Expedicion" || tipo_evento === "Devolucion") {
      documento.almacen = almacen;
      if (tipo_evento === "Devolucion") {
        documento.cajas_rotas = cajas_rotas || {
          blancas: 0,
          negras: 0,
          verdes: 0,
        };
        documento.tapas_rotas = tapas_rotas || {
          blancas: 0,
          negras: 0,
          verdes: 0,
        };
      }
      coleccion = db.collection(tipo_evento);
    }

    if (!coleccion) {
      return NextResponse.json(
        { error: "Tipo de evento inválido" },
        { status: 400 },
      );
    }

    const resultado = await coleccion.insertOne(documento);

    return NextResponse.json({
      success: true,
      id: resultado.insertedId,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Error al crear el evento" },
      { status: 500 },
    );
  }
}
