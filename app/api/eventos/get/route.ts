import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo");
    const id = searchParams.get("id");

    if (!tipo || !id) {
      return NextResponse.json(
        { error: "Tipo e id son requeridos" },
        { status: 400 },
      );
    }

    const usuarioCookie = request.cookies.get("usuario");
    if (!usuarioCookie) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection(tipo);
    const item = await collection.findOne({ _id: new ObjectId(id) });
    if (!item) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 },
      );
    }
    // convert _id to string
    return NextResponse.json({ ...item, _id: item._id.toString() });
  } catch (err) {
    console.error("Error fetching event detail:", err);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
