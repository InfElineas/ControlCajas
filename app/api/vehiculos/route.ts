import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const vehiculos = db.collection("Vehiculo");
    const listaVehiculos = await vehiculos.find({}).toArray();
    return NextResponse.json(listaVehiculos);
  } catch (error) {
    console.error("Error fetching vehiculos:", error);
    return NextResponse.json(
      { error: "Error al obtener vehículos" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { db } = await connectToDatabase();
    const vehiculos = db.collection("Vehiculo");
    const result = await vehiculos.insertOne(body);
    return NextResponse.json({ _id: result.insertedId, ...body });
  } catch (error) {
    console.error("Error creating vehiculo:", error);
    return NextResponse.json(
      { error: "Error al crear vehículo" },
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
        { error: "ID de vehículo requerido" },
        { status: 400 },
      );
    }
    const { db } = await connectToDatabase();
    const vehiculos = db.collection("Vehiculo");
    await vehiculos.updateOne(
      { _id: ObjectId.createFromHexString(_id) },
      { $set: data },
    );
    return NextResponse.json({ _id, ...data });
  } catch (error) {
    console.error("Error updating vehiculo:", error);
    return NextResponse.json(
      { error: "Error al actualizar vehículo" },
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
        { error: "ID de vehículo requerido" },
        { status: 400 },
      );
    }
    const { db } = await connectToDatabase();
    const vehiculos = db.collection("Vehiculo");
    await vehiculos.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting vehiculo:", error);
    return NextResponse.json(
      { error: "Error al eliminar vehículo" },
      { status: 500 },
    );
  }
}
