import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get("fecha");

    if (!fecha) {
      return NextResponse.json({ error: "Fecha requerida" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const cierre = await db.collection("Cierre").findOne({ fecha });

    if (cierre) {
      return NextResponse.json(cierre);
    } else {
      return NextResponse.json(null);
    }
  } catch (error) {
    console.error("Error al obtener cierre:", error);
    return NextResponse.json(
      { error: "Error al obtener cierre" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { fecha, cierre_cd, cierre_almacen } = data;

    if (!fecha) {
      return NextResponse.json({ error: "Fecha requerida" }, { status: 400 });
    }

    // Verificar si ya existe un cierre para esta fecha
    const { db } = await connectToDatabase();
    const cierreExistente = await db.collection("Cierre").findOne({ fecha });

    if (cierreExistente) {
      return NextResponse.json(
        { error: "Ya existe un cierre para esta fecha" },
        { status: 409 },
      );
    }

    const nuevoCierre = {
      fecha,
      cierre_almacen,
      cierre_cd,
    };

    const resultado = await db.collection("Cierre").insertOne(nuevoCierre);

    if (resultado.insertedId) {
      return NextResponse.json(nuevoCierre, { status: 201 });
    } else {
      return NextResponse.json(
        { error: "Error al crear cierre" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error al crear cierre:", error);
    return NextResponse.json(
      { error: "Error al crear cierre" },
      { status: 500 },
    );
  }
}
