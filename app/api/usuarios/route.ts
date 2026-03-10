import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Usuario } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const usuarios = db.collection("Usuario");
    const listaUsuarios = (await usuarios.find({}).toArray()).map((u: Usuario) => ({
      _id: u._id.toString(),
      nombre: u.nombre,
      rol: u.rol,
      habilitado: u.habilitado,
      ajuste: u.ajuste,
    }));
    return NextResponse.json(listaUsuarios);
  } catch (error) {
    console.error("Error fetching usuarios:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
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
        { error: "ID de usuario requerido" },
        { status: 400 },
      );
    }
    const { db } = await connectToDatabase();
    const usuarios = db.collection("Usuario");
    await usuarios.updateOne(
      { _id: ObjectId.createFromHexString(_id) },
      { $set: data },
    );
    return NextResponse.json({ _id, ...data });
  } catch (error) {
    console.error("Error updating usuario:", error);
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 },
    );
  }
}
