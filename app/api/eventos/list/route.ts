import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get("fecha");
    const tipo = searchParams.get("tipo"); // Expedicion|Entrega|Devolucion|Recogida

    if (!fecha || !tipo) {
      return NextResponse.json(
        { error: "Fecha y tipo son requeridos" },
        { status: 400 },
      );
    }

    const usuarioCookie = request.cookies.get("usuario");
    let usuario: any = null;
    if (usuarioCookie) {
      try {
        usuario = JSON.parse(usuarioCookie.value);
      } catch {
        // ignore parse errors
      }
    }

    const { db } = await connectToDatabase();

    const mapping: Record<string, string> = {
      Expedicion: "Expedicion",
      Entrega: "Entrega",
      Devolucion: "Devolucion",
      Recogida: "Recogida",
    };

    const collectionName = mapping[tipo];
    if (!collectionName) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    const filter: any = { fecha };
    // Si no es informatico, limitar a los eventos creados por el usuario
    if (!usuario) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    if (usuario?.rol !== "informatico") {
      filter.nombre = usuario.nombre;
    }

    let items = await db.collection(collectionName).find(filter).toArray();

    // convert ObjectId to string and apply ajuste values to cajas
    items = items.map((it: any) => {
      const item = {
        ...it,
        _id: it._id.toString(),
      };

      // Apply ajuste to cajas if it exists
      if (item.ajuste) {
        item.cajas = {
          blancas:
            (item.cajas?.blancas ?? 0) + (item.ajuste.cajas?.blancas ?? 0),
          negras: (item.cajas?.negras ?? 0) + (item.ajuste.cajas?.negras ?? 0),
          verdes: (item.cajas?.verdes ?? 0) + (item.ajuste.cajas?.verdes ?? 0),
        };
        item.cajas_rotas = {
          blancas:
            (item.cajas_rotas?.blancas ?? 0) +
            (item.ajuste.cajas_rotas?.blancas ?? 0),
          negras:
            (item.cajas_rotas?.negras ?? 0) +
            (item.ajuste.cajas_rotas?.negras ?? 0),
          verdes:
            (item.cajas_rotas?.verdes ?? 0) +
            (item.ajuste.cajas_rotas?.verdes ?? 0),
        };
        item.tapas_rotas = {
          blancas:
            (item.tapas_rotas?.blancas ?? 0) +
            (item.ajuste.tapas_rotas?.blancas ?? 0),
          negras:
            (item.tapas_rotas?.negras ?? 0) +
            (item.ajuste.tapas_rotas?.negras ?? 0),
          verdes:
            (item.tapas_rotas?.verdes ?? 0) +
            (item.ajuste.tapas_rotas?.verdes ?? 0),
        };
        // Replace ajuste object with just the nombre
        item.ajuste = item.ajuste.nombre || "";
      }

      return item;
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error listing events:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 },
    );
  }
}
