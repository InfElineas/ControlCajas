import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const almacenes = db.collection("Almacen");
    const listaAlmacenes = await almacenes.find({}).toArray();
    return NextResponse.json(listaAlmacenes);
  } catch (error) {
    console.error("Error fetching almacenes:", error);
    return NextResponse.json(
      { error: "Error al obtener almacenes" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { db } = await connectToDatabase();
    const almacenes = db.collection("Almacen");
    const result = await almacenes.insertOne(body);
    return NextResponse.json({ _id: result.insertedId, ...body });
  } catch (error) {
    console.error("Error creating almacen:", error);
    return NextResponse.json(
      { error: "Error al crear almacen" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { _id, ...data } = body;
    if (!_id) {
      return NextResponse.json(
        { error: "ID de almacen requerido" },
        { status: 400 },
      );
    }
    const { db } = await connectToDatabase();
    const almacenes = db.collection("Almacen");
    await almacenes.updateOne(
      { _id: ObjectId.createFromHexString(_id) },
      { $set: data },
    );
    return NextResponse.json({ _id, ...data });
  } catch (error) {
    console.error("Error updating almacen:", error);
    return NextResponse.json(
      { error: "Error al actualizar almacen" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "ID de almacen requerido" },
        { status: 400 },
      );
    }
    const { db } = await connectToDatabase();
    const almacenes = db.collection("Almacen");
    await almacenes.deleteOne({ _id: ObjectId.createFromHexString(id) });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting almacen:", error);
    return NextResponse.json(
      { error: "Error al eliminar almacen" },
      { status: 500 },
    );
  }
}
