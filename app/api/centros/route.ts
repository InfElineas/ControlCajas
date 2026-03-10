import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const centros = db.collection("CentroDistribucion");
    const listaCentros = await centros.find({}).toArray();
    return NextResponse.json(listaCentros);
  } catch (error) {
    console.error("Error fetching centros:", error);
    return NextResponse.json(
      { error: "Error al obtener centros" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { db } = await connectToDatabase();
    const centros = db.collection("CentroDistribucion");
    const result = await centros.insertOne(body);
    return NextResponse.json({ _id: result.insertedId, ...body });
  } catch (error) {
    console.error("Error creating centro:", error);
    return NextResponse.json(
      { error: "Error al crear centro" },
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
        { error: "ID de centro requerido" },
        { status: 400 },
      );
    }
    const { db } = await connectToDatabase();
    const centros = db.collection("CentroDistribucion");
    await centros.updateOne(
      { _id: ObjectId.createFromHexString(_id) },
      { $set: data },
    );
    return NextResponse.json({ _id, ...data });
  } catch (error) {
    console.error("Error updating centro:", error);
    return NextResponse.json(
      { error: "Error al actualizar centro" },
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
        { error: "ID de centro requerido" },
        { status: 400 },
      );
    }
    const { db } = await connectToDatabase();
    const centros = db.collection("CentroDistribucion");
    await centros.deleteOne({ _id: ObjectId.createFromHexString(id) });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting centro:", error);
    return NextResponse.json(
      { error: "Error al eliminar centro" },
      { status: 500 },
    );
  }
}
